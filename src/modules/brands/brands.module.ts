import { Module } from '@nestjs/common';
import { BrandsService } from './service/brands.service';
import { BrandsController } from './brands.controller';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
