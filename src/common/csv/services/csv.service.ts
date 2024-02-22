import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@modules/database/services/database.service';
import _ from 'lodash';
import csv from 'csv-parser';
import { createReadStream, unlinkSync } from 'fs';
import {
  CreatedByEnum,
  DailyRating,
  LanguageEnum,
  Order,
  OrderCreatedByEnum,
  OrderEmailTypeEnum,
  OrderReviewStatus,
  PaymentStatusEnum,
  Rating,
  RoleEnum,
  StatusEnum,
  TaskNote,
  TaskStatusEnum,
  TaskTypeEnum,
} from '@prisma/client';
import { CreateCSVDto, TableNameTypes } from '../dto/create-csv.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { HashService } from '@modules/auth/services/hash.service';
import { AlternateEmailEntity } from '@modules/alternate-emails/entities/alternate-email.entity';
import { BrandEntity } from '@modules/brands/entities/brand.entity';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { ClientInfoEntity } from '@modules/clients/entities/client-info.entity';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import { dd } from '@src/common/helpers/debug';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { OrderReviewEntity } from '@modules/orders/entities/order-review.entity';
import { TaskEntity } from '@modules/my-tasks/entities/task.entity';
import { TaskAccountantEntity } from '@modules/my-tasks/entities/task-accountant.entity';
import { TaskSellerEntity } from '@modules/my-tasks/entities/task-seller.entity';

@Injectable()
export class CSVService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async create({ file, table }: CreateCSVDto) {
    let csvData = [];

    const stream = createReadStream(file.path);
    const parser = stream.pipe(csv());
    let fields: string[] | null = null;
    const promises = [];

    for await (const data of parser) {
      if (!fields) {
        fields = Object.keys(data)
          .filter((key) => !/\d/.test(key))
          .filter((key) => key !== '');
      }

      if (['user', 'client'].includes(table)) {
        let defaultPassword: string;
        if (table === 'user') {
          // ? If the User is an Admin, then it will have a default password. If not, then it will create a random hashed password
          defaultPassword = data.role === '1' ? 'grocketseller' : null;

          promises.push(
            this.hashService
              .generateAndHashPassword(defaultPassword)
              .then(({ hash }) => {
                data.password = hash;
              }),
          );
        } else {
          data.password = 'testing@123!lZitngdsPRTuncH6912JxQ';
        }
      }

      for (const field of fields) {
        data[field] =
          data[field] !== ''
            ? this.convertField(data[field], field, table)
            : null;
      }

      csvData.push(data);
    }

    csvData = csvData.map((data) => {
      for (const field of fields) {
        if (
          [
            'seller_email',
            'number_of_reviews',
            'reviewers',
            'logs',
            'order_status',
          ].includes(field)
        ) {
          delete data[field];
        } else if (field.match(/\bid\b/)) {
          // ? It will replace the property 'id' into id
          data.id = data[field];

          const occurrenceId = Object.keys(data).filter((key) =>
            key.match(/\bid\b/),
          ).length;

          if (occurrenceId > 1) delete data[field];
        } else if (field === 'date' && table === 'orderLog') {
          data.createdAt = data[field];
          delete data[field];
        } else if (field === 'task_type_id') {
          data.taskType = data[field];
          delete data[field];
        } else if (
          ['clientId', 'orderId'].includes(field) &&
          table === 'task' &&
          data[field] === 0
        ) {
          data[field] = null;
        } else if (field === 'stars' && !data[field]) {
          data[field] = [];
        }

        if (data['status'] === 'DELETED' || data['is_archived'] === 'DELETED')
          data.deletedAt = new Date(data.updatedAt);

        if (data['is_archived']) delete data.is_archived;
      }

      return data;
    });

    await Promise.all(promises);

    unlinkSync(file.path);

    // TODO: After importing all the data, restart the primary keys (IDs) based on the ID of the last record in each table.
    switch (table) {
      case 'user':
        const csvFilteredData = csvData.filter(
          (data: UserEntity) => data.email !== null,
        );
        await this.createManyUsers(csvFilteredData);
        break;
      case 'alternateEmail':
        await this.createAlternateEmails(csvData);
        break;
      case 'brand':
        await this.createBrands(csvData);
        break;
      case 'client':
        // TODO: After importing all the clients' Data, update the password with nestjs command
        await this.createManyClients(csvData);
        break;
      case 'company':
        await this.createManyCompanies(csvData);
        break;
      case 'order':
        await this.createManyOrders(csvData);
        break;
      case 'orderLog':
        await this.createManyOrderLogs(csvData);
        break;
      case 'orderReview':
        await this.createManyOrderReviews(csvData);
        break;
      case 'task':
        await this.createManyTasks(csvData);
        break;
      case 'taskAccountant':
        await this.createManyTaskAccountants(csvData);
        break;
      case 'taskSeller':
        await this.createManyTaskSellers(csvData);
        break;
      case 'taskNote':
        await this.createManyTodoNotes(csvData);
        break;
      case 'rating':
        await this.createManyRatings(csvData);
        break;
      case 'dailyRating':
        await this.createManyDailyRatings(csvData);
        break;
    }

    return { message: 'Imported CSV Successfully!' };
  }

  private async createManyUsers(data: UserEntity[]) {
    return await this.database.$transaction(async (tx) => {
      return await tx.user.createMany({ data });
    });
  }

  private async createAlternateEmails(data: AlternateEmailEntity[]) {
    return await this.database.$transaction(async (tx) => {
      return await tx.alternateEmail.createMany({ data });
    });
  }

  private async createBrands(data: BrandEntity[]) {
    return await this.database.$transaction(async (tx) => {
      return await tx.brand.createMany({ data });
    });
  }

  private async createManyClients(csvData: any[]) {
    const clientData: ClientEntity[] = csvData.map((data: ClientEntity) => ({
      id: data.id,
      sellerId: data.sellerId,
      name: data.name,
      email: data.email,
      password: data.password,
      forgot_password_code: data.forgot_password_code,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    }));

    const clientInfoData: ClientInfoEntity[] = csvData.map(
      (data: ClientInfoEntity) => ({
        id: data.id,
        clientId: data.id,
        sourceId: data.sourceId,
        brandId: data.brandId,
        industryId: data.industryId,
        phone: data.phone,
        sentOffer: data.sentOffer,
        hasLoggedIn: data.hasLoggedIn,
        thirdPartyId: data.thirdPartyId,
        default_unit_cost: data.default_unit_cost,
        status: data.status,
        tier: data.tier,
        language: data.language,
        profile_url: data.profile_url,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      }),
    );

    const createdClients = await this.database.$transaction(async (tx) => {
      const clients = await tx.client.createMany({ data: clientData });
      await tx.clientInfo.createMany({ data: clientInfoData });
      return clients;
    });

    return { message: 'Successfully Created Client', clients: createdClients };
  }

  private async createManyCompanies(csvData: any[]) {
    const data: CompanyEntity[] = csvData
      .map((data) => {
        delete data.status;
        return data;
      })
      .filter((data) => data.clientId !== 0);

    return await this.database.$transaction(async (tx) => {
      return await tx.company.createMany({ data });
    });
  }

  private async createManyOrders(csvData: any[]) {
    const companies = await this.database.company.findMany();
    const companyIds = companies.map((company) => company.id);

    const data: Order[] = csvData.filter((data) =>
      companyIds.includes(data.companyId),
    );

    for (const order of data) {
      try {
        await this.database.order.create({ data: order });
      } catch (error) {
        console.error(`Error for Order ID: ${order.id}: ${error}`);
        continue;
      }
    }
  }

  private async createManyOrderLogs(data: any[]) {
    // const batchSize = 3000;

    // for (let i = 0; i < data.length; i += batchSize) {
    //   const currentBatch = data.slice(i, i + batchSize);

    //   await this.database.$transaction(async (tx) => {
    //     return await tx.orderLog.createMany({ data: currentBatch });
    //   });
    // }

    for (const orderLog of data) {
      try {
        await this.database.$transaction(async (tx) => {
          return await tx.orderLog.create({ data: orderLog });
        });
      } catch (error) {
        console.error(`ERROR FOR ORDER LOG ID: ${orderLog.id}`, error.message);
      }
    }
  }

  private async createManyOrderReviews(data: OrderReviewEntity[]) {
    const orders = await this.database.order.findMany({});

    const orderIds = orders.map((order) => order.id);

    data = data
      .filter((review) => orderIds.includes(review.orderId))
      .filter((data) => data.name);

    return await this.database.$transaction(async (tx) => {
      return await tx.orderReview.createMany({ data });
    });
  }

  private async createManyTasks(data: TaskEntity[]) {
    /* const taskArr = [];
    const uniqueOrderIds = Array.from(
      new Set(data.map((task) => task.orderId)),
    ).filter(Boolean);

    for (const orderId of uniqueOrderIds) {
      const taskWithSameOrderId = data.filter(
        (task) => task.orderId === orderId,
      );

      taskArr.push(taskWithSameOrderId);
    }

    const groupedTasks = _.groupBy(_.flatten(taskArr), 'orderId');

    const taskWithSameOrderIds = _.pickBy(
      groupedTasks,
      (tasks) => tasks.length > 1,
    ); */

    const orders = await this.database.order.findMany({});

    const orderIds = orders.map((order) => order.id);
    data = data.filter(
      (task) =>
        (task.orderId && orderIds.includes(task.orderId)) ||
        task.orderId === null,
    );

    return await this.database.$transaction(async (tx) => {
      return await tx.task.createMany({ data });
    });
  }

  private async createManyTaskAccountants(data: TaskAccountantEntity[]) {
    const tasks = await this.database.task.findMany({
      where: {
        OR: [{ createdBy: 'AUTO' }, { createdBy: 'ACCOUNTANT' }],
      },
    });
    const taskIds = tasks.map((task) => task.id);

    data = data.filter((d) => taskIds.includes(d.taskId));

    return await this.database.$transaction(async (tx) => {
      return await tx.taskAccountant.createMany({ data });
    });
  }

  private async createManyTaskSellers(data: TaskSellerEntity[]) {
    const tasks = await this.database.task.findMany({
      where: {
        OR: [{ createdBy: 'AUTO' }, { createdBy: 'SELLER' }],
      },
    });
    const taskIds = tasks.map((task) => task.id);

    data = data.filter((d) => taskIds.includes(d.taskId));

    return await this.database.$transaction(async (tx) => {
      return await tx.taskSeller.createMany({ data });
    });
  }

  private async createManyTodoNotes(data: TaskNote[]) {
    return await this.database.$transaction(async (tx) => {
      return await tx.taskNote.createMany({ data });
    });
  }

  private async createManyRatings(data: Rating[]) {
    const companies = await this.database.company.findMany();
    const companyIds = companies.map((company) => company.id);

    data = data.filter((rating) => companyIds.includes(rating.companyId));

    return await this.database.$transaction(async (tx) => {
      return await tx.rating.createMany({ data });
    });
  }

  private async createManyDailyRatings(data: DailyRating[]) {
    const companies = await this.database.company.findMany();
    const companyIds = companies.map((company) => company.id);

    data = data.filter((rating) => companyIds.includes(rating.companyId));

    const batchSize = 10000;

    for (let i = 0; i < data.length; i += batchSize) {
      const currentBatch = data.slice(i, i + batchSize);

      await this.database.$transaction(async (tx) => {
        return await tx.dailyRating.createMany({ data: currentBatch });
      });
    }
  }

  private convertField(value: any, fieldName: string, table: TableNameTypes) {
    if (typeof value === 'string' && value.includes('"')) {
      const matches1 = value.match(/""([^"]*)"/);
      const matches2 = value.match(/""([^"]*)/);

      if (matches1) {
        value = matches1[1];
      } else if (matches2) {
        value = matches2[1];
      } else {
        value = value.split('"')[1];
      }
    }

    if (
      /\bid\b/i.test(fieldName) ||
      /Id\b/.test(fieldName) ||
      fieldName.includes('reviews')
    ) {
      return parseInt(value, 10);
    } else if (
      fieldName.includes('cost') ||
      fieldName.includes('price') ||
      ['rating'].includes(fieldName)
    ) {
      return parseFloat(value);
    } else if (
      fieldName === 'createdAt' ||
      fieldName === 'updatedAt' ||
      fieldName === 'completedAt' ||
      fieldName.includes('date')
    ) {
      return value !== '' ? new Date(value) : null;
    } else if (fieldName === 'role') {
      const roleMap = {
        '1': RoleEnum.ADMIN,
        '2': RoleEnum.ACCOUNTANT,
        '3': RoleEnum.SELLER,
      };

      return roleMap[value];
    } else if (
      (fieldName === 'status' &&
        (table === 'user' || table === 'client' || table === 'company')) ||
      (fieldName === 'is_archived' && table === 'order')
    ) {
      const statusMap = {
        '0': StatusEnum.DELETED,
        '1': StatusEnum.ACTIVE,
      };

      return statusMap[value];
    } else if (fieldName === 'status' && table === 'orderReview') {
      const statusMap = {
        '0': OrderReviewStatus.BEAUFTRAGT,
        '1': OrderReviewStatus.WEITERLEITUNG,
        '2': OrderReviewStatus.WIDERSPRUCH,
        '3': OrderReviewStatus.GESCHEITERT,
        '4': OrderReviewStatus.GELOSCHT,
        '5': OrderReviewStatus.NEU,
      };

      return statusMap[value];
    } else if (
      fieldName === 'status' &&
      (table === 'taskAccountant' || table === 'taskSeller')
    ) {
      const statusMap = {
        '0': TaskStatusEnum.DELETED,
        '1': TaskStatusEnum.ACTIVE,
        '2': TaskStatusEnum.COMPLETED,
      };

      return statusMap[value];
    } else if (fieldName === 'payment_status') {
      const statusMap = {
        '0': PaymentStatusEnum.NEW,
        '1': PaymentStatusEnum.SENT_INVOICE,
        '11': PaymentStatusEnum.PR1,
        '12': PaymentStatusEnum.PR2,
        '2': PaymentStatusEnum.PAID,
        '3': PaymentStatusEnum.UNPAID,
      };

      return statusMap[value];
    } else if (
      [
        'hasLoggedIn',
        'sentOffer',
        'latest_check',
        'check_url',
        'valid_url',
        'send_confirmation',
      ].includes(fieldName)
    ) {
      return value === '0' ? false : true;
    } else if (fieldName === 'language') {
      return value === '1' ? LanguageEnum.GERMAN : LanguageEnum.ENGLISH;
    } else if (fieldName === 'createdBy' && table === 'order') {
      const createdByMap = {
        '0': null,
        '1': OrderCreatedByEnum.ADMIN,
        '2': OrderCreatedByEnum.ACCOUNTANT,
        '3': OrderCreatedByEnum.SELLER,
        '4': OrderCreatedByEnum.CLIENT,
      };

      return createdByMap[value];
    } else if (fieldName === 'createdBy' && table === 'task') {
      const createdByMap = {
        '0': CreatedByEnum.AUTO,
        '1': CreatedByEnum.ACCOUNTANT,
        '2': CreatedByEnum.SELLER,
      };

      return createdByMap[value];
    } else if (fieldName === 'email_type') {
      const emailTypeMap = {
        beauftragt: OrderEmailTypeEnum.BEAUFTRAGT,
        weiterleitung: OrderEmailTypeEnum.WEITERLEITUNG,
        gescheitert: OrderEmailTypeEnum.GESCHEITERT,
      };

      return emailTypeMap[value];
    } else if (fieldName === 'task_type_id') {
      const taskTypeMap = {
        '0': null,
        '1': TaskTypeEnum.SENT_INVOICE,
        '2': TaskTypeEnum.PR1,
        '3': TaskTypeEnum.PR2,
        '4': TaskTypeEnum.TWO_MTFU,
        '5': TaskTypeEnum.UNPAID,
      };

      return taskTypeMap[value];
    } else if (fieldName === 'stars') {
      return JSON.parse(value);
    }

    return value;
  }
}
