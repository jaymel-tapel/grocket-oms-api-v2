import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Body,
} from '@nestjs/common';
import { DeprecatedCSVService } from './services/csv.service';
import { JwtGuard } from '@modules/auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCSVDto } from './dto/create-csv.dto';
import { ApiExcludeController } from '@nestjs/swagger';

// * I used this when the team was migrating the data from Laravel to NestJS
@UseGuards(JwtGuard)
@Controller('csv-private')
@ApiExcludeController()
export class DeprecatedCSVController {
  constructor(private readonly csvService: DeprecatedCSVService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() { table }: CreateCSVDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.csvService.create({ file, table });
  }
}
