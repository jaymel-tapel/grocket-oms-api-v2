import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
