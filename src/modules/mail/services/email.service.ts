import { HttpException, Injectable } from '@nestjs/common';
import { SendEmailByTemplateDto } from '@modules/mail/dto/send-email-by-template.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { OrderEmailTypeEnum } from '@prisma/client';
import { OrdersService } from '@modules/orders/services/orders.service';
import { OrderReviewsService } from '@modules/orders/services/order-reviews.service';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { OrderReviewEntity } from '@modules/orders/entities/order-review.entity';
import { OrderLogsService } from '@modules/orders/services/order-logs.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly ordersService: OrdersService,
    private readonly orderReviewsService: OrderReviewsService,
    private readonly orderLogsService: OrderLogsService,
  ) {}

  async sendEmailByTemplate(
    orderId: number,
    sendEmailDto: SendEmailByTemplateDto,
    authUser: UserEntity,
  ) {
    const order = new OrderEntity(
      await this.ordersService.findUniqueOrThrow({
        where: { id: orderId },
        include: { client: { include: { seller: true } } },
      }),
    );

    if (
      sendEmailDto.template === OrderEmailTypeEnum.GESCHEITERT &&
      sendEmailDto.reviewIds.length > 0
    ) {
      const allReviewsBelongToOrder = await Promise.all(
        sendEmailDto.reviewIds.map(async (reviewId) => {
          const reviewExists =
            await this.orderReviewsService.findReviewsByOrderId(
              reviewId,
              orderId,
            );
          return !!reviewExists;
        }),
      );

      if (!allReviewsBelongToOrder.every(Boolean)) {
        throw new HttpException(
          'Invalid Order Reviews for specific Order',
          400,
        );
      }

      const reviews = await this.orderReviewsService.findManyReviews(
        sendEmailDto.reviewIds,
      );

      // ? Send Email
      await this.orderReviewSendEmail(order, sendEmailDto.template, reviews);
    } else {
      await this.orderReviewSendEmail(order, sendEmailDto.template);
    }

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(orderId, authUser, {
      action: 'status mail sent',
      email_type: sendEmailDto.template,
    });

    return { message: 'Email sent successfully!' };
  }

  private async orderReviewSendEmail(
    order: OrderEntity,
    template: OrderEmailTypeEnum,
    reviews?: OrderReviewEntity[],
  ) {
    let subject: string;

    if (template === OrderEmailTypeEnum.BEAUFTRAGT) {
      subject = 'Statusbericht Ihres Auftrags';
    } else if (template === OrderEmailTypeEnum.WEITERLEITUNG) {
      subject = 'Statusbericht Ihres Auftrages || 2. Schritt';
    } else {
      subject = 'Finaler Statusbericht Ihres Auftrages';
    }

    await this.mailerService.sendMail({
      subject,
      to: order.client.email,
      replyTo: order.client.seller.email,
      template: 'order-review-by-template',
      context: {
        ...(reviews && { reviews }),
        template,
      },
      attachments: [
        {
          filename: 'Logo_iew4yg.png',
          path: process.env.G_ROCKET_LOGO,
          cid: 'image@review',
        },
      ],
    });
  }
}
