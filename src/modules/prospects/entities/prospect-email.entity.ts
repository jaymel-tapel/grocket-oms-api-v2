import { ApiProperty } from '@nestjs/swagger';

export class ProspectEmailEntity {
  @ApiProperty({ example: 'Email sent successfully!' })
  message: string;

  @ApiProperty()
  errors_count: number;
}
