import { HttpException, Injectable } from '@nestjs/common';
import { CreateOrderClientDto, CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderCombinedDto } from '../dto/update-order.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '../../users/entities/user.entity';
import { ClientsService } from '@modules/clients/services/clients.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UsersService } from '@modules/users/services/users.service';
import { Prisma, RoleEnum } from '@prisma/client';
import { CompaniesService } from '@modules/companies/services/companies.service';
import { OrderEntity } from '../entities/order.entity';
import { dd } from '@src/common/helpers/debug';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';
import { findManyOrdersQuery } from '../helpers/find-many-orders.helper';
import { orderIncludeHelper } from '../helpers/order-include.helper';
import { AlternateEmailEntity } from '@modules/alternate-emails/entities/alternate-email.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
    private readonly clientService: ClientsService,
    private readonly companiesService: CompaniesService,
  ) {}

  private async validateSellerAndClient(
    seller_email: string,
    client_email: string,
  ) {
    const sellerEntity: UserEntity = await this.database.user.findFirst({
      where: { email: seller_email },
    });

    const alterAccount = await this.database.alternateEmail.findFirst({
      where: { email: seller_email },
      include: { user: true },
    });

    const clientEntity: ClientEntity = await this.database.client.findFirst({
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
    } else if (clientEntity && (!sellerEntity || !alterAccount)) {
      throw new HttpException('The client already has a seller', 400);
    }

    return { sellerEntity, alterAccount, clientEntity };
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
      ...orderData
    } = createOrderDto;

    return await this.database.$transaction(async (tx) => {
      // TODO: Find a way to support Cross Module transaction using Prisma
      // ? Validate Seller and CLient
      let { sellerEntity, alterAccount, clientEntity } =
        await this.validateSellerAndClient(seller_email, client_email);

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

      if (!clientEntity) {
        // ? Create new client
        clientEntity = await this.clientService.create(sellerEntity, {
          name: client_name,
          email: client_email,
          default_unit_cost: orderData.unit_cost,
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

      const unit_cost =
        orderData.unit_cost ?? +clientEntity.clientInfo.default_unit_cost;

      // ? Create new Order
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          unit_cost,
          createdBy: authUser.role,
          client: {
            connect: { id: clientEntity.id },
          },
          company: {
            connect: { id: companyEntity.id },
          },
        },
      });

      // ? Create Order Reviews
      for (const review of orderReviews) {
        await tx.orderReview.create({
          data: {
            ...review,
            order: { connect: { id: newOrder.id } },
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: newOrder.id },
        data: {
          total_price: orderReviews.length * unit_cost,
        },
        include: {
          client: {
            include: {
              seller: true,
              clientInfo: true,
            },
          },
        },
      });

      return updatedOrder;
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

  async findOne(id: number) {
    const database = await this.database.softDelete();

    return await database.order.findUnique({
      where: { id },
      include: orderIncludeHelper(),
    });
  }

  async update(
    id: number,
    { updateOrder, updateClientInfo, updateCompany }: UpdateOrderCombinedDto,
  ) {
    const {
      seller_email,
      seller_name,
      client_email,
      client_name,
      ...orderData
    } = updateOrder;

    const { ...clientInfoData } = updateClientInfo;
    const { ...companyData } = updateCompany;

    return await this.database.$transaction(async (tx) => {
      // ? Validate Seller and Client
      let { sellerEntity, alterAccount, clientEntity } =
        await this.validateSellerAndClient(seller_email, client_email);

      const orderReviewsCount = await tx.orderReview.count({
        where: { orderId: id },
      });

      const updatedOrder = tx.order.update({
        where: { id },
        data: {
          ...orderData,
          ...(orderData.unit_cost && {
            total_price: orderReviewsCount * orderData.unit_cost,
          }),
        },
      });
    });
  }

  async remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
