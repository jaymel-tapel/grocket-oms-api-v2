import { HttpException, Injectable } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { HashService } from 'src/modules/auth/services/hash.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { dd } from '@src/common/helpers/debug';
import { TransferClientsDto } from '../dto/transfer-client.dto';
import { UsersService } from '@modules/users/services/users.service';
import { ClientEntity } from '../entities/client.entity';
import { FilterClientsDto } from '../dto/filter-client.dto';
import {
  findManyClients,
  sellerFindManyClients,
} from '../helpers/find-many-clients.helper';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';
import { FindClientsBySellerDto } from '../dto/find-clients-by-seller.dto';
import { clientIncludeHelper } from '../helpers/client-include.helper';
import { EventsService } from '@modules/events/services/events.service';
import { SendGeneratedPasswordDto } from '../dto/generate-password.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ClientsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly mailerService: MailerService,
  ) {}

  async create(authUser: UserEntity, createClientDto: CreateClientDto) {
    let {
      name,
      email,
      password: passDto,
      sellerId,
      ...clientInfoDto
    } = createClientDto;

    if (authUser.role !== RoleEnum.SELLER && !sellerId) {
      throw new HttpException('sellerId should not be empty', 400);
    } else if (authUser.role === RoleEnum.SELLER) {
      sellerId = authUser.id;
    } else if (sellerId) {
      const foundSeller = await this.usersService.findOne({
        id: sellerId,
        role: 'SELLER',
      });

      if (!foundSeller) {
        throw new HttpException('Seller not found', 404);
      }

      sellerId = foundSeller.id;
    }

    const foundClient = await this.findOneWithDeleted({
      email: { equals: email, mode: 'insensitive' },
    });

    const clientInfoObj = foundClient?.clientInfo;

    if (clientInfoObj?.status === StatusEnum.BLOCKED) {
      throw new HttpException('Client is blocked', 400);
    } else if (clientInfoObj?.status === StatusEnum.DELETED) {
      return await this.restore(foundClient.id, authUser);
    } else if (clientInfoObj) {
      throw new HttpException('Client already exists', 409);
    }

    const passwordObj = await this.hashService.generateAndHashPassword(
      passDto ?? null,
    );

    const newClient = await this.database.client.create({
      data: {
        name,
        email,
        password: passwordObj.hash,
        seller: { connect: { id: sellerId } },
        clientInfo: { create: clientInfoDto },
      },
      include: { clientInfo: true },
    });

    return newClient;
  }

  async findAllByCondition(args: Prisma.ClientFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.client.findMany(args);
  }

  async findAllPagination(
    authUser: UserEntity,
    findManyArgs: FilterClientsDto,
    offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    const { perPage, page } = offsetPageArgsDto;
    const database = await this.database.softDelete();
    const paginate = createPaginator({ perPage, page });

    let findManyQuery: Prisma.ClientFindManyArgs = {};

    if (authUser.role !== RoleEnum.SELLER) {
      findManyQuery = await findManyClients(findManyArgs, this.database);
    } else {
      findManyQuery = await sellerFindManyClients(
        authUser,
        findManyArgs,
        this.database,
      );
    }

    const paginatedClients = await paginate<
      ClientEntity,
      Prisma.ClientFindManyArgs
    >(database.client, findManyQuery, offsetPageArgsDto);

    paginatedClients.data = paginatedClients.data.map(
      (client) => new ClientEntity(client),
    );

    return paginatedClients;
  }

  async findAllClientsBySeller({ sellerId, keyword }: FindClientsBySellerDto) {
    const database = await this.database.softDelete();
    return await database.client.findMany({
      where: {
        sellerId,
        email: { contains: keyword, mode: 'insensitive' },
      },
      include: clientIncludeHelper(),
    });
  }

  async findOne(
    data: Prisma.ClientWhereInput,
    args?: Prisma.ClientFindFirstArgs,
  ) {
    const database = await this.database.softDelete();
    return await database.client.findFirst({
      where: { ...data },
      ...args,
    });
  }

  async findOneOrThrow(
    data: Prisma.ClientWhereInput,
    args?: Prisma.ClientFindFirstOrThrowArgs,
  ) {
    const database = await this.database.softDelete();
    return await database.client.findFirstOrThrow({
      where: { ...data },
      ...args,
    });
  }

  async findOneWithDeleted(
    data: Prisma.ClientWhereInput,
    args?: Prisma.ClientFindFirstArgs,
  ) {
    return await this.database.client.findFirst({
      where: {
        ...data,
        AND: {
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      },
      include: { clientInfo: true },
      ...args,
    });
  }

  async findUniqueWithDeleted(id: number) {
    return await this.database.client.findUnique({ where: { id } });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const { name, email, sellerId, ...clientInfoDto } = updateClientDto;

    const updatedClient = await this.database.client.update({
      where: { id },
      data: {
        name,
        email,
        sellerId,
        clientInfo: {
          update: clientInfoDto,
        },
      },
      include: { clientInfo: true },
    });

    this.eventsService.emitUpdateClientEvent(updatedClient);

    return updatedClient;
  }

  async remove(id: number, authUser: UserEntity) {
    const database = await this.database.softDelete();

    const client = await database.client.findUniqueOrThrow({ where: { id } });

    await database.client.update({
      where: { id },
      data: {
        clientInfo: {
          update: { data: { status: 'DELETED' } },
          delete: {},
        },
      },
    });

    this.eventsService.emitDeleteClientEvent(client, authUser);

    return await database.client.delete({
      where: { id },
    });
  }

  async restore(id: number, authUser: UserEntity) {
    const client = await this.database.client.update({
      where: { id },
      data: {
        deletedAt: null,
        clientInfo: {
          update: {
            where: { clientId: id },
            data: { status: 'ACTIVE', deletedAt: null },
          },
        },
      },
    });

    this.eventsService.emitRestoreClientEvent(client, authUser);

    return client;
  }

  async findAllIndustries() {
    return await this.database.clientIndustry.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findAllSource() {
    return await this.database.clientSource.findMany({});
  }

  async transferClients({ to_seller_email, ids }: TransferClientsDto) {
    const seller = await this.usersService.findOne({ email: to_seller_email });

    const clients = await Promise.all(
      ids.map(async (id) => {
        let client = await this.findOne({ id });

        if (!client) {
          return null;
        }

        client = await this.database.client.update({
          where: { id },
          data: {
            sellerId: seller.id,
            orders: {
              updateMany: {
                where: { clientId: id },
                data: { sellerId: seller.id },
              },
            },
          },
        });

        return client;
      }),
    );

    return clients.filter(Boolean);
  }

  async generatePassword(client: ClientEntity) {
    const { hash, text } = await this.hashService.generateAndHashPassword();

    const password = hash;

    client = await this.database.client.update({
      where: { id: client.id },
      data: { password },
    });

    return {
      client,
      password_text: text,
    };
  }

  async sendEmail({ clientId, password }: SendGeneratedPasswordDto) {
    const client = await this.findOneOrThrow({ id: clientId });

    const comparePassword = await this.hashService.comparePassword(
      password,
      client.password,
    );

    if (!comparePassword) {
      throw new HttpException(`The provided password is incorrect`, 400);
    }

    const link = process.env.FE_ROUTE;
    const email = client.email;

    const data = {
      link,
      password,
      email,
    };

    await this.mailerService.sendMail({
      to: email,
      subject: `Reset Password`,
      template: 'forgot-password',
      context: data,
    });

    return { message: `Email sent successfully!` };
  }
}
