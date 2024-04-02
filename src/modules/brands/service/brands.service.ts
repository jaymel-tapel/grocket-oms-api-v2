import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { CloudinaryService } from '@modules/cloudinary/services/cloudinary.service';
import { extractPublicIdFromUrl } from '@modules/profile/helpers/upload-photo.helper';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { PrismaDynamicClient } from '@src/common/types/prisma.types';

@Injectable()
export class BrandsService {
  private database: PrismaDynamicClient;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.initDB();
  }

  private async initDB() {
    this.database = await this.dbService.softDelete();
  }

  async create(createBrandDto: CreateBrandDto, image?: Express.Multer.File) {
    const { logo, ...data } = createBrandDto;
    let imageUrl: UploadApiResponse | UploadApiErrorResponse;

    const code = await this.database.brand.findFirst({
      where: { code: data.code },
    });

    if (code) {
      throw new ConflictException('Code already taken');
    }

    if (image) {
      imageUrl = await this.uploadImage(image);
    }

    return await this.database.brand.create({
      data: {
        ...data,
        ...(imageUrl && { logo: imageUrl.secure_url }),
      },
    });
  }

  async findAll() {
    return await this.database.brand.findMany({});
  }

  async findUnique(id: number) {
    return await this.database.brand.findUnique({ where: { id } });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brandInfo = await this.database.brand.findUnique({ where: { id } });

    if (!brandInfo) {
      throw new NotFoundException('Brand not found');
    }

    return await this.database.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async modifyLogo(
    id: number,
    image?: Express.Multer.File,
    image_delete?: boolean,
  ) {
    if (image_delete) {
      return await this.removeLogo(id);
    } else if (image) {
      return await this.updateLogo(id, image);
    }
  }

  private async updateLogo(id: number, image: Express.Multer.File) {
    const brandInfo = await this.database.brand.findUnique({ where: { id } });

    if (!brandInfo) {
      throw new NotFoundException('Brand not found');
    }

    if (brandInfo.logo) {
      const publicId = extractPublicIdFromUrl(brandInfo.logo);
      await this.cloudinaryService.destroyImage(publicId);
    }

    const imageUrl = await this.uploadImage(image);

    return await this.database.brand.update({
      where: { id },
      data: { logo: imageUrl.secure_url },
    });
  }

  private async removeLogo(id: number) {
    const brandInfo = await this.database.brand.findUnique({ where: { id } });

    if (!brandInfo) {
      throw new NotFoundException('Brand not found');
    }

    if (brandInfo.logo) {
      const publicId = extractPublicIdFromUrl(brandInfo.logo);
      await this.cloudinaryService.destroyImage(publicId);
    } else {
      return new NotFoundException('Brand logo not found');
    }

    return await this.database.brand.update({
      where: { id },
      data: { logo: null },
    });
  }

  async remove(id: number) {
    const brandInfo = await this.database.brand.findUnique({ where: { id } });

    if (!brandInfo) {
      throw new NotFoundException('Brand not found');
    }

    if (brandInfo.logo) {
      const publicId = extractPublicIdFromUrl(brandInfo.logo);
      await this.cloudinaryService.destroyImage(publicId);
    }

    return await this.database.brand.delete({ where: { id } });
  }

  private async uploadImage(image: Express.Multer.File) {
    return await this.cloudinaryService.uploadImage(image).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
  }
}
