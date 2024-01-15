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
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../users/services/users.service';
import { ClientEntity } from './entities/client.entity';
import { TransferClientsDto } from './dto/transfer-client.dto';
import { FilterClientsDto } from './dto/filter-client.dto';
import { JwtGuard } from '@modules/auth/guard';
import { PageEntity } from '@modules/page/page.entity';
import { AbilityFactory, Action } from '@modules/casl/ability.factory';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ForbiddenError } from '@casl/ability';
import { ClientIndustryEntity } from './entities/client-industries.entity';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { ApiOffsetPageResponse } from '@modules/offset-page/api-offset-page-response.decorator';

@UseGuards(JwtGuard)
@ApiTags('clients')
@Controller('clients')
@ApiBearerAuth()
@ApiExtraModels(PageEntity)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly usersService: UsersService,
    private readonly abilityFactory: AbilityFactory,
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

  @Get('industries')
  @ApiOkResponse({ type: ClientIndustryEntity, isArray: true })
  async findAllIndustries() {
    return await this.clientsService.findAllIndustries();
  }

  @Get()
  @ApiOffsetPageResponse(ClientEntity)
  async findAll(
    @AuthUser() user: UserEntity,
    @Query() findManyArgs: FilterClientsDto,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    return await this.clientsService.findAllPagination(
      user,
      findManyArgs,
      offsetPageArgsDto,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ClientEntity })
  async findOne(
    @AuthUser() authUser: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ability = await this.abilityFactory.defineAbility(authUser);
    const client = await this.clientsService.findOne(
      { id },
      {
        include: {
          clientInfo: {
            include: {
              source: true,
              industry: true,
            },
          },
          seller: true,
        },
      },
    );

    ForbiddenError.from(ability).throwUnlessCan(
      Action.Read,
      new ClientEntity(client),
    );

    return new ClientEntity(client);
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
