import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './services/companies.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyArgsDto } from './dto/company-args.dto';

@ApiTags('companies')
@Controller('companies')
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
}
