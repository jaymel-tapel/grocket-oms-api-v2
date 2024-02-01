import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { EmailController } from './email.controller';
import { OrdersModule } from '@modules/orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
