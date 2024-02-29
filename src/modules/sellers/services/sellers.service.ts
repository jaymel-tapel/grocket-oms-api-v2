import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { FilterSellersDto } from '../dto/filter-seller.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { findManySellers } from '../helpers/find-many-sellers.helper';
import { TransferSellerDataDto } from '../dto/transfer-seller-data.dto';
import { AlternateEmailsService } from '@modules/alternate-emails/services/alternate-emails.service';

@Injectable()
export class SellersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly alternateEmailService: AlternateEmailsService,
  ) {}

  async findAll(
    findManyArgs: FilterSellersDto,
    offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    const { perPage } = offsetPageArgsDto;
    const database = await this.database.softDelete();
    const paginate = createPaginator({ perPage });

    let findManyQuery: Prisma.UserFindManyArgs = {};

    findManyQuery = await findManySellers(findManyArgs, this.database);

    const paginatedSellers = await paginate<
      UserEntity,
      Prisma.UserFindManyArgs
    >(database.user, findManyQuery, offsetPageArgsDto);

    paginatedSellers.data = paginatedSellers.data.map(
      (seller) => new UserEntity(seller),
    );

    return paginatedSellers;
  }

  async findOne(args: Prisma.UserFindFirstArgs, includeDeleted?: boolean) {
    const database = includeDeleted
      ? this.database
      : await this.database.softDelete();
    return await database.user.findFirst({
      ...args,
      where: { ...args.where },
    });
  }

  async remove(id: number) {
    const database = await this.database.softDelete();

    const seller = await database.user.delete({
      where: { id },
    });

    await database.user.update({
      where: { id: seller.id },
      data: { status: 'DELETED' },
    });

    return seller;
  }

  async transferSellersData({
    to_seller_email,
    emails,
  }: TransferSellerDataDto) {
    let transferToSeller = await this.findOne(
      { where: { email: { equals: to_seller_email, mode: 'insensitive' } } },
      true,
    );

    if (transferToSeller.status === 'DELETED') {
      transferToSeller = await this.database.user.update({
        where: { id: transferToSeller.id },
        data: { status: 'ACTIVE', deletedAt: null },
      });
    }

    const transferredSellers = await Promise.all(
      emails.map(async (email) => {
        let alter = await this.alternateEmailService.findByCondition({
          where: { email: { equals: email, mode: 'insensitive' } },
        });
        /*
         ? If there's an alter email, then it will find by alter email's userId
         ? if not, then it will find by email
        */
        let seller = await this.findOne({
          where: {
            ...((alter && { id: alter.userId }) ?? {
              email: { equals: email, mode: 'insensitive' },
            }),
          },
        });

        if (!seller) {
          return null;
        }

        const sellerId = seller.id;

        const orders = await this.database.order.updateMany({
          where: { sellerId },
          data: { sellerId: transferToSeller.id },
        });

        const clients = await this.database.client.updateMany({
          where: { sellerId },
          data: { sellerId: transferToSeller.id },
        });

        const alter_emails = await this.database.alternateEmail.updateMany({
          where: { userId: sellerId },
          data: { userId: transferToSeller.id },
        });

        seller = await this.remove(sellerId);

        return {
          seller,
          orders: orders.count,
          clients: clients.count,
          alternate_emails: alter_emails.count,
        };
      }),
    );

    return transferredSellers.filter(Boolean);
  }
}
