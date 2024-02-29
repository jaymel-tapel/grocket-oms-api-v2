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
import { CSVService } from './services/csv.service';
import { JwtGuard } from '@modules/auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCSVDto } from './dto/create-csv.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@Controller('csv')
@ApiExcludeController()
export class CSVController {
  constructor(private readonly csvService: CSVService) {}

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
