import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './services/companies.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyArgsDto } from './dto/company-args.dto';
import { JwtGuard } from '@modules/auth/guard';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
@UseGuards(JwtGuard)
@ApiTags('companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiCreatedResponse({ type: CompanyEntity })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return new CompanyEntity(
      await this.companiesService.create(createCompanyDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: CompanyEntity, isArray: true })
  async findAll(@Query() companyArgs?: CompanyArgsDto) {
    const companies = await this.companiesService.findAll(companyArgs);
    return companies.map((company) => new CompanyEntity(company));
  }

  @Patch(':id')
  @ApiOkResponse({ type: CompanyEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return new CompanyEntity(
      await this.companiesService.update(id, updateCompanyDto),
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: CompanyEntity })
  async remove(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new CompanyEntity(await this.companiesService.remove(id, user));
  }

  @Patch('restore/:id')
  @ApiOkResponse({ type: CompanyEntity })
  async restore(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new CompanyEntity(await this.companiesService.restore(id, user));
  }
}
