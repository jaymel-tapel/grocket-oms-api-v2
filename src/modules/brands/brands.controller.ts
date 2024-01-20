import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BrandsService } from './service/brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrandEntity } from './entities/brand.entity';
import { BrandArgsDto } from './dto/brand-args.dto';
import { JwtGuard } from '@modules/auth/guard';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FileValidationPipe } from '@modules/profile/pipes/file-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPhotoDto } from '@modules/profile/dto/upload-photo.dto';

@UseGuards(JwtGuard)
@ApiTags('brands')
@Controller('brands')
@ApiBearerAuth()
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiCreatedResponse({ type: BrandEntity })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(new FileValidationPipe()) image?: Express.Multer.File | null,
  ) {
    return new BrandEntity(
      await this.brandsService.create(createBrandDto, image),
    );
  }

  @Get()
  @ApiOkResponse({ type: BrandEntity, isArray: true })
  async findAll(@Query() brandArgs?: BrandArgsDto) {
    const brands = await this.brandsService.findAll(brandArgs);
    return brands.map((brand) => new BrandEntity(brand));
  }

  @Patch(':id')
  @ApiOkResponse({ type: BrandEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandsService.update(id, updateBrandDto);
  }

  @Post('logo/:id')
  @ApiOkResponse({ type: BrandEntity })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(
    @Param('id', ParseIntPipe) id: number,
    @Body() { image_delete }: UploadPhotoDto,
    @UploadedFile(new FileValidationPipe()) image?: Express.Multer.File | null,
  ) {
    return await this.brandsService.modifyLogo(id, image, image_delete);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BrandEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.brandsService.remove(id);
  }
}
