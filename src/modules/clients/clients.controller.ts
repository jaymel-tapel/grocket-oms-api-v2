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
  Put,
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
import {
  ClientEntity,
  GeneratePasswordEntity,
  SendGeneratedPasswordEntity,
} from './entities/client.entity';
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
import { ClientSourceEntity } from './entities/client-source.entity';
import { FindClientsBySellerDto } from './dto/find-clients-by-seller.dto';
import { ClientReportDateRangeDto } from './dto/get-client-report.dto';
import { ClientReportsService } from './services/client-reports.service';
import { ClientReportEntity } from './entities/client-report.entity';
import { SendGeneratedPasswordDto } from './dto/generate-password.dto';
import { RoleEnum } from '@prisma/client';

@UseGuards(JwtGuard)
@ApiTags('clients')
@Controller('clients')
@ApiBearerAuth()
@ApiExtraModels(PageEntity)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly clientReportsService: ClientReportsService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ClientEntity })
  async create(
    @AuthUser() authUser: UserEntity,
    @Body() createClientDto: CreateClientDto,
  ) {
    const createdClient = await this.clientsService.create(
      authUser,
      createClientDto,
    );

    return new ClientEntity(createdClient);
  }

  @Get('industries')
  @ApiOkResponse({ type: ClientIndustryEntity, isArray: true })
  async findAllIndustries() {
    return await this.clientsService.findAllIndustries();
  }

  @Get('source')
  @ApiOkResponse({ type: ClientSourceEntity, isArray: true })
  async findAllOrigin() {
    return await this.clientsService.findAllSource();
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

  @Get('search')
  @ApiOkResponse({ type: ClientEntity, isArray: true })
  async findAllClientsBySeller(
    @Query() findClientsDto: FindClientsBySellerDto,
  ) {
    const clients = await this.clientsService.findAllClientsBySeller(
      findClientsDto,
    );
    return clients.map((client) => new ClientEntity(client));
  }

  @Get('report')
  @ApiOkResponse({ type: ClientReportEntity })
  async getClientReport(
    @AuthUser() user: UserEntity,
    @Query() reportDto: ClientReportDateRangeDto,
  ) {
    if (user.role === RoleEnum.SELLER) {
      reportDto.sellerId = user.id;
    }

    return new ClientReportEntity(
      await this.clientReportsService.report(reportDto),
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
          companies: true,
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
  @ApiOkResponse({ type: ClientEntity, isArray: true })
  async transferClients(@Body() transferClientsDto: TransferClientsDto) {
    const clients = await this.clientsService.transferClients(
      transferClientsDto,
    );
    return clients.map((client) => new ClientEntity(client));
  }

  @Put('generate-password/:id')
  @ApiOkResponse({ type: GeneratePasswordEntity })
  async generatePassword(@Param('id', ParseIntPipe) id: number) {
    const client = await this.clientsService.findOneOrThrow({ id });
    return new GeneratePasswordEntity(
      await this.clientsService.generatePassword(client),
    );
  }

  @Post('send-email')
  @ApiOkResponse({ type: SendGeneratedPasswordEntity })
  async sendEmailGeneratedPassword(
    @Body() sendGeneratedPasswordDto: SendGeneratedPasswordDto,
  ) {
    return await this.clientsService.sendEmail(sendGeneratedPasswordDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ClientEntity })
  async remove(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new ClientEntity(await this.clientsService.remove(id, user));
  }

  @Patch('restore/:id')
  @ApiOkResponse({ type: ClientEntity })
  async restore(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new ClientEntity(await this.clientsService.restore(id, user));
  }
}
