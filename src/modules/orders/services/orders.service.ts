import { HttpException, Injectable } from '@nestjs/common';
import { CreateOrderClientDto, CreateOrderDto } from '../dto/create-order.dto';
import {
  UpdateOrderCombinedDto,
  UpdateOrderDto,
} from '../dto/update-order.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '../../users/entities/user.entity';
import { ClientsService } from '@modules/clients/services/clients.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UsersService } from '@modules/users/services/users.service';
import { PaymentStatusEnum, Prisma, RoleEnum } from '@prisma/client';
import { CompaniesService } from '@modules/companies/services/companies.service';
import { OrderEntity } from '../entities/order.entity';
import { dd } from '@src/common/helpers/debug';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';
import { findManyOrdersQuery } from '../helpers/find-many-orders.helper';
import { orderIncludeHelper } from '../helpers/order-include.helper';
import { AlternateEmailEntity } from '@modules/alternate-emails/entities/alternate-email.entity';
import { OrderLogsService } from './order-logs.service';
import { paymentStatusNameHelper } from '../helpers/payment-status-name.helper';
import { CloudinaryService } from '@modules/cloudinary/services/cloudinary.service';
import { clientIncludeHelper } from '@modules/clients/helpers/client-include.helper';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
    private readonly clientService: ClientsService,
    private readonly companiesService: CompaniesService,
    private readonly orderLogsService: OrderLogsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailerService: MailerService,
  ) {}

  private async validateSellerAndClient(
    authUser: UserEntity,
    {
      seller_name,
      seller_email,
      client_email,
    }: CreateOrderDto | UpdateOrderDto,
  ) {
    let sellerEntity: UserEntity = await this.database.user.findFirst({
      where: { email: seller_email },
    });

    let alterAccount: AlternateEmailEntity =
      await this.database.alternateEmail.findFirst({
        where: { email: seller_email },
        include: { user: true },
      });

    let clientEntity: ClientEntity = await this.database.client.findFirst({
      where: { email: client_email },
      include: { clientInfo: true },
    });

    // ? Validate Seller and CLient
    if (
      clientEntity &&
      sellerEntity &&
      (clientEntity.sellerId !== sellerEntity.id ||
        clientEntity.sellerId !== alterAccount.userId)
    ) {
      throw new HttpException('The seller does not own this client', 400);
    } else if (
      clientEntity &&
      !sellerEntity &&
      alterAccount.userId !== clientEntity.sellerId
    ) {
      throw new HttpException('The client already has a seller', 400);
    }

    if (authUser.role !== RoleEnum.SELLER) {
      if (sellerEntity || alterAccount) {
        sellerEntity = sellerEntity ?? alterAccount.user;
      } else {
        // ? Create new Seller
        sellerEntity = await this.usersService.create({
          name: seller_name,
          email: seller_email,
          role: 'SELLER',
          password: process.env.DEFAULT_PASSWORD,
        });
      }
    } else {
      sellerEntity = authUser;
    }

    return { sellerEntity, clientEntity };
  }

  async create(
    authUser: UserEntity,
    createOrderDto: CreateOrderDto,
    createOrderClientDto: CreateOrderClientDto,
  ) {
    const {
      seller_email,
      seller_name,
      client_name,
      client_email,
      company_name,
      company_url,
      orderReviews,
      file,
      ...orderDto
    } = createOrderDto;
    let invoice_image: string;

    // ? Validate Seller and CLient
    let { sellerEntity, clientEntity } = await this.validateSellerAndClient(
      authUser,
      createOrderDto,
    );

    const unit_cost =
      orderDto.unit_cost ?? +clientEntity.clientInfo.default_unit_cost;

    const newOrder = await this.database.$transaction(async (tx) => {
      // TODO: Find a way to support Cross Module transaction using Prisma
      if (!clientEntity) {
        // ? Create new client
        clientEntity = await this.clientService.create(sellerEntity, {
          name: client_name,
          email: client_email,
          default_unit_cost: orderDto.unit_cost,
          ...createOrderClientDto,
        });
      }

      // ? Find Company
      let companyEntity = await this.companiesService.findOne({
        where: {
          name: company_name,
          clientId: clientEntity.id,
        },
      });

      if (!companyEntity) {
        // ? Create new company
        companyEntity = await this.companiesService.create({
          clientId: clientEntity.id,
          name: company_name,
          url: company_url,
        });
      }

      // ? Create new Order
      const newOrder = await tx.order.create({
        data: {
          ...orderDto,
          unit_cost,
          createdBy: authUser.role,
          client: {
            connect: { id: clientEntity.id },
          },
          company: {
            connect: { id: companyEntity.id },
          },
          orderReviews: {
            createMany: {
              data: orderReviews,
            },
          },
        },
      });

      if (file) {
        invoice_image = (await this.cloudinaryService.uploadImage(file))
          .secure_url;
      }

      return newOrder;
    });

    const updatedOrder = await this.database.order.update({
      where: { id: newOrder.id },
      data: {
        ...(file && { invoice_image }),
        total_price: orderReviews.length * unit_cost,
      },
      include: {
        client: {
          include: clientIncludeHelper({ include: { brand: true } }),
        },
      },
    });

    const adminEmails = process.env.ADMIN_EMAILS.split(',');
    // ? Send Email to the seller about new order
    await this.newOrderEmail(updatedOrder, updatedOrder.client, adminEmails);

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(updatedOrder.id, authUser, {
      action: 'order created',
    });

    return updatedOrder;
  }

  private async newOrderEmail(
    order: OrderEntity,
    client: ClientEntity,
    admins: string[],
  ) {
    const brand = client.clientInfo.brand;
    return await this.mailerService.sendMail({
      subject: `${brand.name} Order Details`,
      to: client.seller.email,
      cc: admins,
      template: 'new-order-notif',
      context: {
        orderId: order.id,
        brand_name: brand.name,
        seller_email: client.seller.email,
        client_email: client.email,
        total_price: order.total_price,
      },
    });
  }

  async findAllWithPagination(
    authUser: UserEntity,
    filterOrderArgs: FilterOrderDto,
    offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    const { perPage } = offsetPageArgsDto;
    const database = await this.database.softDelete();
    const paginate = createPaginator({ perPage });

    let findManyQuery: Prisma.OrderFindManyArgs = {};

    if (authUser.role !== RoleEnum.SELLER) {
      findManyQuery = await findManyOrdersQuery(filterOrderArgs, this.database);
    }

    const paginatedOrders = await paginate<
      OrderEntity,
      Prisma.OrderFindManyArgs
    >(database.order, findManyQuery, offsetPageArgsDto);

    paginatedOrders.data = paginatedOrders.data.map(
      (order) => new OrderEntity(order),
    );

    return paginatedOrders;
  }

  async findAllDeletedWithPagination(offsetPageArgsDto: OffsetPageArgsDto) {
    const { perPage } = offsetPageArgsDto;
    const paginate = createPaginator({ perPage });

    let findManyQuery: Prisma.OrderFindManyArgs = {
      where: { deletedAt: { not: null } },
      include: { orderReviews: true, client: true },
    };

    const paginatedOrders = await paginate<
      OrderEntity,
      Prisma.OrderFindManyArgs
    >(this.database.order, findManyQuery, offsetPageArgsDto);

    paginatedOrders.data = paginatedOrders.data.map(
      (order) => new OrderEntity(order),
    );

    return paginatedOrders;
  }

  async findOne(id: number) {
    const database = await this.database.softDelete();

    return await database.order.findUnique({
      where: { id },
      include: orderIncludeHelper(),
    });
  }

  async update(
    id: number,
    authUser: UserEntity,
    { updateOrder, updateClientInfo }: UpdateOrderCombinedDto,
  ) {
    const {
      seller_email,
      seller_name,
      client_email,
      client_name,
      ...orderData
    } = updateOrder;

    // ? Validate Seller and Client
    let { sellerEntity, clientEntity } = await this.validateSellerAndClient(
      authUser,
      updateOrder,
    );

    if (!clientEntity) {
      // ? Create new client
      clientEntity = await this.clientService.create(sellerEntity, {
        name: client_name,
        email: client_email,
        default_unit_cost: orderData.unit_cost,
        ...(updateClientInfo as CreateOrderClientDto),
      });
    } else {
      clientEntity = await this.clientService.update(
        clientEntity.id,
        updateClientInfo,
      );
    }

    // ? Find Company and Update
    await this.companiesService
      .findOne({
        where: { id: orderData.companyId },
      })
      .then(async (company) => {
        await this.database.company.update({
          where: { id: company.id },
          data: { clientId: clientEntity.id },
        });
      });

    const orderReviewsCount = await this.database.orderReview.count({
      where: { orderId: id },
    });

    let updatedOrder = await this.database.order.update({
      where: { id },
      data: {
        ...orderData,
        clientId: clientEntity.id,
        ...(orderData.unit_cost && {
          total_price: orderReviewsCount * orderData.unit_cost,
        }),
      },
    });

    if (orderData.payment_status) {
      updatedOrder = await this.updatePaymentStatus(
        orderData.payment_status,
        updatedOrder,
        authUser,
      );
    }

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(updatedOrder.id, authUser, {
      action: 'order updated',
    });

    return updatedOrder;
  }

  private async updatePaymentStatus(
    payment_status: PaymentStatusEnum,
    order: OrderEntity,
    authUser: UserEntity,
  ) {
    const isValidPaymentStatus = [
      PaymentStatusEnum.NEW,
      PaymentStatusEnum.PR1,
      PaymentStatusEnum.PR2,
    ].some((value) => value === payment_status);

    if (payment_status === PaymentStatusEnum.PAID) {
      order = await this.database.order.update({
        where: { id: order.id },
        data: { date_paid: new Date() },
      });
    } else if (isValidPaymentStatus) {
      order = await this.database.order.update({
        where: { id: order.id },
        data: { payment_status_date: new Date(), date_paid: null },
      });
    }

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(order.id, authUser, {
      action: `Payment status has been updated to ${paymentStatusNameHelper(
        payment_status,
      )}`,
    });

    return order;
  }

  async remove(id: number, authUser: UserEntity) {
    const database = await this.database.softDelete();

    await database.orderReview.deleteMany({
      where: { orderId: id, deletedAt: null },
    });

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(id, authUser, {
      action: 'order deleted',
    });

    return await database.order.delete({
      where: { id },
    });
  }
}
