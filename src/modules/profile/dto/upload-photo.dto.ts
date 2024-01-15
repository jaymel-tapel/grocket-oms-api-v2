import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UploadPhotoDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  image: Express.Multer.File;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  image_delete?: boolean;
}
