import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { FilterSellersDto } from '../dto/filter-seller.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { findManySellers } from '../helpers/find-many-sellers.helper';

@Injectable()
export class SellersService {
  constructor(private readonly database: DatabaseService) {}

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
}
