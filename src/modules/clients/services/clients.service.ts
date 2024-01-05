import { HttpException, Injectable } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { Prisma, StatusEnum } from '@prisma/client';
import { HashService } from 'src/modules/auth/services/hash.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { dd } from '@src/common/helpers/debug';
import { TransferClientsDto } from '../dto/transfer-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async create(authUser: UserEntity, createClientDto: CreateClientDto) {
    const {
      name,
      email,
      password: passDto,
      ...clientInfoDto
    } = createClientDto;

    return await this.database.$transaction(async (tx) => {
      const foundClient = await this.findOneWithDeleted({ email });

      const clientInfoObj = foundClient?.clientInfo;

      if (clientInfoObj?.status === StatusEnum.BLOCKED) {
        throw new HttpException('Client is blocked', 400);
      } else if (clientInfoObj?.status === StatusEnum.DELETED) {
        return await this.restore(foundClient.id);
      } else if (clientInfoObj) {
        throw new HttpException('Client already exists', 409);
      }

      const passwordObj = await this.hashService.generateAndHashPassword(
        passDto ?? null,
      );

      const newClient = tx.client.create({
        data: {
          name,
          email,
          password: passwordObj.hash,
          seller: { connect: { id: authUser.id } },
          clientInfo: { create: clientInfoDto },
        },
        include: { clientInfo: true },
      });

      return await newClient;
    });
  }

  async findAll() {
    const database = await this.database.softDelete();
    return await database.client.findMany({
      include: { seller: true, clientInfo: true },
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
    const { name, email, ...clientInfoDto } = updateClientDto;

    return await this.database.client.update({
      where: { id },
      data: {
        name,
        email,
        clientInfo: {
          update: clientInfoDto,
        },
      },
      include: { clientInfo: true },
    });
  }

  async remove(id: number) {
    const database = await this.database.softDelete();

    return await database.$transaction(async (tx) => {
      const client = await tx.client.findUniqueOrThrow({ where: { id } });

      await tx.clientInfo.delete({
        where: { clientId: id },
      });

      await tx.client.delete({
        where: { id: id },
      });

      await tx.clientInfo.update({
        where: { clientId: id },
        data: { status: 'DELETED' },
      });

      return client;
    });
  }

  async restore(id: number) {
    const database = await this.database.softDelete();
    const foundClient = await this.findUniqueWithDeleted(id);

    const client = await database.client.update({
      where: { id: foundClient.id },
      data: {
        deletedAt: null,
        clientInfo: {
          update: {
            where: { clientId: foundClient.id },
            data: { status: 'ACTIVE', deletedAt: null },
          },
        },
      },
    });

    return client;
  }

  // async transferClients({ emails }: TransferClientsDto) {
  //   emails.map();
  // }
}
