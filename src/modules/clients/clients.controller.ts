import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/services/users.service';
import { ClientEntity } from './entities/client.entity';
import { TransferClientsDto } from './dto/transfer-client.dto';
import { ApiPageResponse } from '@modules/page/api-page-response.decorator';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';
import { FindManyClientsDto } from './dto/filter-client.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ClientEntity })
  async create(@Body() createClientDto: CreateClientDto) {
    const user = await this.usersService.findUniqueOrThrow(1);

    const createdClient = await this.clientsService.create(
      user,
      createClientDto,
    );

    return new ClientEntity(createdClient);
  }

  @Get()
  @ApiPageResponse(ClientEntity)
  async findAll(
    @Query() findManyArgs: FindManyClientsDto,
    @Query() connectionArgs: ConnectionArgsDto,
  ) {
    // ! Temporary User for testing purposes
    const user = await this.usersService.findUniqueOrThrow(3);

    return await this.clientsService.findAllPagination(
      user,
      findManyArgs,
      connectionArgs,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ClientEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new ClientEntity(
      await this.clientsService.findOne(
        { id },
        { include: { clientInfo: true, seller: true } },
      ),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: ClientEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return new ClientEntity(
      await this.clientsService.update(id, updateClientDto),
    );
  }

  @Post('transfer')
  @ApiOkResponse({ type: ClientEntity })
  async transferClients(@Body() transferClientsDto: TransferClientsDto) {
    const clients = await this.clientsService.transferClients(
      transferClientsDto,
    );
    return clients.map((client) => new ClientEntity(client));
  }

  @Delete(':id')
  @ApiOkResponse({ type: ClientEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new ClientEntity(await this.clientsService.remove(id));
  }

  @Patch('restore/:id')
  @ApiOkResponse({ type: ClientEntity })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return new ClientEntity(await this.clientsService.restore(id));
  }
}
