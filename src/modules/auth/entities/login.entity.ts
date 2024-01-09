import { ApiProperty } from '@nestjs/swagger';

export class LoginEntity {
  @ApiProperty()
  access_token: string;
}
