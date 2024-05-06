import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
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
import {
  PaymentStatusEnum,
  Prisma,
  RoleEnum,
  TaskTypeEnum,
} from '@prisma/client';
import { CompaniesService } from '@modules/companies/services/companies.service';
import { OrderEntity } from '../entities/order.entity';
import { dd } from '@src/common/helpers/debug';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';
import {
  findManyOrdersQuery,
  findManyOrdersQueryForSeller,
} from '../helpers/find-many-orders.helper';
import { orderIncludeHelper } from '../helpers/order-include.helper';
import { AlternateEmailEntity } from '@modules/alternate-emails/entities/alternate-email.entity';
import { OrderLogsService } from './order-logs.service';
import { paymentStatusNameHelper } from '../helpers/payment-status-name.helper';
import { CloudinaryService } from '@modules/cloudinary/services/cloudinary.service';
import { clientIncludeHelper } from '@modules/clients/helpers/client-include.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { extractPublicIdFromUrl } from '@modules/profile/helpers/upload-photo.helper';
import { InvoicesService } from '@modules/invoices/services/invoices.service';
import PuppeteerHTMLPDF from 'puppeteer-html-pdf';
import handlebars from 'handlebars';
import * as fs from 'fs/promises';
import { format } from 'date-fns';
import { TasksService } from '@modules/my-tasks/services/tasks.service';
import { isEmpty } from 'lodash';
import { OrderReviewsService } from './order-reviews.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
    private readonly clientService: ClientsService,
    private readonly companiesService: CompaniesService,
    private readonly orderLogsService: OrderLogsService,
    private readonly orderReviewsService: OrderReviewsService,
    private readonly invoicesService: InvoicesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailerService: MailerService,
    private readonly tasksService: TasksService,
  ) {}

  private async validateSellerAndClient(
    authUser: UserEntity,
    {
      seller_name,
      seller_email,
      client_email,
    }: CreateOrderDto | UpdateOrderDto,
  ) {
    const database = await this.database.softDelete();

    let sellerEntity: UserEntity = await database.user.findFirst({
      where: { email: { equals: seller_email, mode: 'insensitive' } },
    });

    let alterAccount: AlternateEmailEntity =
      await this.database.alternateEmail.findFirst({
        where: { email: { equals: seller_email, mode: 'insensitive' } },
        include: { user: true },
      });

    let clientEntity: ClientEntity = await this.database.client.findFirst({
      where: { email: { equals: client_email, mode: 'insensitive' } },
      include: { clientInfo: true },
    });

    const doesNotMatch =
      clientEntity && sellerEntity && clientEntity.sellerId !== sellerEntity.id;
    const doesNoMatch2 =
      clientEntity &&
      alterAccount &&
      alterAccount?.userId !== clientEntity.sellerId;

    // ? Validate Seller and CLient
    if (doesNotMatch || doesNoMatch2) {
      const sellerId = sellerEntity ? sellerEntity.id : alterAccount.userId;
      // ? Update Client's Seller Id
      clientEntity = await this.clientService.update(clientEntity.id, {
        sellerId,
      });
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
      // ? If the authenticated User is a Seller
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

    if (!clientEntity) {
      // ? Create new client
      clientEntity = await this.clientService.create(sellerEntity, {
        name: client_name,
        email: client_email,
        default_unit_cost: orderDto.unit_cost,
        ...createOrderClientDto,
      });
    } else {
      clientEntity = await this.clientService.update(clientEntity.id, {
        sellerId: sellerEntity.id,
      });
    }

    // ? Find Company
    let companyEntity = await this.companiesService.findOne({
      where: {
        name: { equals: company_name, mode: 'insensitive' },
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
    const newOrder = await this.database.order.create({
      data: {
        ...orderDto,
        unit_cost,
        createdBy: authUser.role,
        client: { connect: { id: clientEntity.id } },
        brand: { connect: { id: clientEntity.clientInfo.brandId } },
        seller: { connect: { id: sellerEntity.id } },
        seller_email,
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
        company: true,
      },
    });

    const adminEmails = process.env.ADMIN_EMAILS.split(',');
    // ? Send Email to the seller about new order
    await this.newOrderEmail(updatedOrder, updatedOrder.client, adminEmails);

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(updatedOrder.id, authUser, {
      action: 'order created',
    });

    if (orderDto.send_confirmation) {
      const reviewers = orderReviews.map((reviewer) => reviewer.name);
      await this.sendConfirmationEmail(
        clientEntity,
        sellerEntity,
        reviewers,
        unit_cost,
        updatedOrder.company.name,
      );

      // ? Create a Log for the Order
      await this.orderLogsService.createLog(newOrder.id, authUser, {
        action: 'order confirmation sent',
      });
    }

    return updatedOrder;
  }

  private async sendConfirmationEmail(
    clientEntity: ClientEntity,
    sellerEntity: UserEntity,
    orderReviews: string[],
    unit_cost: number,
    company_name: string,
  ) {
    return await this.mailerService.sendMail({
      subject: 'Bestellbestätigung',
      to: clientEntity.email,
      replyTo: sellerEntity.email,
      template: 'order-confirmation',
      context: {
        name: clientEntity.name,
        orderReviews,
        unit_cost,
        company_name,
      },
      attachments: [
        {
          filename: 'Logo_iew4yg.png',
          path: process.env.G_ROCKET_LOGO,
          cid: 'image@review',
        },
      ],
    });
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

  async findUniqueOrThrow(args: Prisma.OrderFindUniqueOrThrowArgs) {
    const database = await this.database.softDelete();
    return await database.order.findUniqueOrThrow(args);
  }

  async findAllWithPagination(
    authUser: UserEntity,
    filterOrderArgs: FilterOrderDto,
    offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    const { perPage, page } = offsetPageArgsDto;

    const database = filterOrderArgs.showDeleted
      ? this.database
      : await this.database.softDelete();

    const paginate = createPaginator({ perPage, page });

    let findManyQuery: Prisma.OrderFindManyArgs = {};

    if (authUser.role !== RoleEnum.SELLER) {
      findManyQuery = await findManyOrdersQuery(filterOrderArgs, this.database);
    } else {
      findManyQuery = await findManyOrdersQueryForSeller(
        authUser,
        filterOrderArgs,
        this.database,
      );
    }

    const paginatedOrders = await paginate<
      OrderEntity,
      Prisma.OrderFindManyArgs
    >(this.database.order, findManyQuery, offsetPageArgsDto);

    paginatedOrders.data = await Promise.all(
      paginatedOrders.data.map(async (order) => {
        const orderReviews =
          await this.orderReviewsService.findManyReviewsByOrderId(order.id);

        const orderLogs = await this.orderLogsService.findManyByOrderId(
          order.id,
        );

        const client = order.client;

        const companies = await this.companiesService.findAll({
          clientId: client.id,
        });

        return new OrderEntity({
          ...order,
          orderReviews,
          orderLogs,
          client: { ...client, clientInfo: client.clientInfo, companies },
        });
      }),
    );

    const foundOrders = await database.order.findMany(findManyQuery);

    const total = foundOrders.reduce((a, b) => a + +b.total_price, 0);

    const unpaid_invoices = foundOrders
      .filter((order) => order.payment_status === 'UNPAID')
      .reduce((a, b) => a + +b.total_price, 0);

    const paid_commission =
      foundOrders
        .filter((order) => order.payment_status === 'PAID')
        .reduce((a, b) => a + +b.total_price, 0) * 0.3;

    const current_commission =
      foundOrders.reduce((a, b) => a + +b.total_price, 0) * 0.3;

    const order_revenue_summary = {
      total,
      unpaid_invoices,
      paid_commission,
      current_commission,
    };

    return {
      ...paginatedOrders,
      order_revenue_summary,
    };
  }

  async findOne(id: number) {
    const database = await this.database.softDelete();

    return await database.order.findUniqueOrThrow({
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
      clientEntity = await this.clientService.update(clientEntity.id, {
        ...updateClientInfo,
        sellerId: sellerEntity.id,
      });
    }

    // ? Find Company and Update
    const company = await this.database.company.update({
      where: { id: orderData.companyId },
      data: { clientId: clientEntity.id },
    });

    const orderReviews = await this.database.orderReview.findMany({
      where: { orderId: id },
    });

    let updatedOrder = await this.database.order.update({
      where: { id },
      data: {
        ...orderData,
        sellerId: sellerEntity.id,
        seller_email,
        brandId: clientEntity.clientInfo.brandId,
        companyId: company.id,
        clientId: clientEntity.id,
        ...((orderData.unit_cost || orderData.unit_cost === 0) && {
          total_price: orderReviews.length * orderData.unit_cost,
        }),
      },
    });

    if (orderData.payment_status) {
      updatedOrder = await this.updatePaymentStatus(
        orderData.payment_status,
        updatedOrder,
        clientEntity,
        authUser,
      );
    }

    if (orderData.send_confirmation) {
      const reviewers = orderReviews.map((reviewer) => reviewer.name);

      await this.sendConfirmationEmail(
        clientEntity,
        sellerEntity,
        reviewers,
        orderData.unit_cost ?? +updatedOrder.unit_cost,
        company.name,
      );

      // ? Create a Log for the Order
      await this.orderLogsService.createLog(updatedOrder.id, authUser, {
        action: 'order confirmation sent',
      });
    }

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(updatedOrder.id, authUser, {
      action: 'order updated',
    });

    return updatedOrder;
  }

  async generateInvoicePDFBuffer(order: OrderEntity) {
    const htmlPDF = new PuppeteerHTMLPDF();
    htmlPDF.setOptions({ format: 'A4' });

    const templatePath = 'src/templates/pdf/invoice-pdf.hbs';

    const templateContent = await htmlPDF.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);

    const brand = order.client.clientInfo.brand;
    const currency = brand.currency;
    const currencySymbol = currency === 'USD' ? '$' : '€';
    const currentDate = format(new Date(), 'MMM dd, yyyy');
    const paid_to_date = 0.0;
    const invoice = await this.invoicesService.create({ orderId: order.id });
    const amount = +invoice.amount;

    const orderData = {
      invoice_no: invoice.invoiceId,
      to_company: order.company.name,
      date: currentDate,
      invoice_due: null,
      descriptions: invoice.review_names,
      qty: invoice.quantity,
      rate: invoice.rate,
      amount,
      total: amount,
      paid_to_date,
      balance: amount - paid_to_date,
      currency,
      currencySymbol,
    };

    const htmlContent = compiledTemplate(orderData);

    const pdfBuffer = await htmlPDF.create(htmlContent);
    // Define the folder where you want to store the PDFs
    const folderPath = 'public/pdf';

    // Create the folder if it doesn't exist
    await fs.mkdir(folderPath, { recursive: true });

    // Generate the file name based on the order ID
    const fileName = `order-#${order.id}_invoice-${invoice.invoiceId}.pdf`;

    // Combine the folder path and file name to get the full file path
    // const filePath = join(folderPath, fileName);

    // await htmlPDF.writeFile(pdfBuffer, filePath);

    return pdfBuffer;
  }

  private async updatePaymentStatus(
    payment_status: PaymentStatusEnum,
    order: OrderEntity,
    client: ClientEntity,
    authUser: UserEntity,
  ) {
    const isValidPaymentStatus = [
      PaymentStatusEnum.SENT_INVOICE,
      PaymentStatusEnum.PR1,
      PaymentStatusEnum.PR2,
    ].some((value) => value === payment_status);

    const foundTask = await this.tasksService.findOne({
      where: { orderId: order.id, createdBy: 'AUTO' },
      orderBy: { createdAt: 'asc' },
    });

    const title = paymentStatusNameHelper(payment_status);
    const description =
      payment_status === 'UNPAID'
        ? `${client.name} is unpaid`
        : `Payment status ${title} for ${client.name}`;

    if (payment_status === PaymentStatusEnum.PAID) {
      order = await this.database.order.update({
        where: { id: order.id },
        data: { date_paid: new Date() },
      });

      const updateQuery: any = {
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      };

      if (!isEmpty(foundTask)) {
        await this.database.task.update({
          where: { id: foundTask.id },
          data: {
            taskAccountant: updateQuery,
            taskSeller: updateQuery,
          },
        });
      }
    } else if (isValidPaymentStatus) {
      order = await this.database.order.update({
        where: { id: order.id },
        data: { payment_status_date: new Date(), date_paid: null },
      });

      if (isEmpty(foundTask)) {
        await this.tasksService.create(authUser, {
          title,
          description,
          orderId: order.id,
          taskType: payment_status as TaskTypeEnum,
          client_email: client?.email,
          createdBy: 'AUTO',
        });
      } else {
        await this.tasksService.update(authUser, foundTask.id, {
          title,
          description,
          taskType: payment_status as TaskTypeEnum,
          client_email: client?.email,
        });
      }
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

    const tasks = await this.tasksService.findAllByCondition({
      where: { orderId: id },
      select: { id: true },
    });

    const taskIds = tasks.map((task) => task.id);

    await this.tasksService.removeMany(taskIds);

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(id, authUser, {
      action: 'order deleted',
    });

    return await database.order.delete({
      where: { id },
    });
  }

  async restore(id: number, authUser: UserEntity) {
    const order = await this.database.order.update({
      where: { id, deletedAt: { not: null }, company: { deletedAt: null } },
      data: {
        deletedAt: null,
        orderReviews: {
          updateMany: {
            where: { orderId: id },
            data: { deletedAt: null },
          },
        },
      },
    });

    const tasks = await this.database.task.findMany({
      where: { orderId: id, deletedAt: { not: null } },
      select: { id: true },
    });

    const taskIds = tasks.map(({ id }) => id);

    await this.tasksService.restoreMany(taskIds);

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(id, authUser, {
      action: 'order restored',
    });

    return order;
  }

  async uploadPhoto(
    order: OrderEntity,
    image?: Express.Multer.File,
    image_delete?: Boolean,
  ) {
    if (image_delete) {
      return await this.removeImage(order);
    } else if (image) {
      return await this.replaceImage(order, image);
    }
  }

  private async removeImage(order: OrderEntity) {
    if (order.invoice_image) {
      const publicId = extractPublicIdFromUrl(order.invoice_image);
      // ? Remove the image from Cloudinary using the destroy method
      await this.cloudinaryService.destroyImage(publicId);
    }

    return await this.database.order.update({
      where: { id: order.id },
      data: {
        invoice_image: null,
      },
    });
  }

  private async replaceImage(order: OrderEntity, image: Express.Multer.File) {
    if (order.invoice_image) {
      await this.removeImage(order);
    }

    // ? Upload the new image to Cloudinary
    const result = await this.cloudinaryService.uploadImage(image).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });

    // ? Update the order's invoice_image with the Cloudinary URL
    return await this.database.order.update({
      where: { id: order.id },
      data: {
        invoice_image: result.secure_url,
      },
    });
  }
}
