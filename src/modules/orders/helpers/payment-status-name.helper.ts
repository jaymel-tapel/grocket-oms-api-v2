import { PaymentStatusEnum } from '@prisma/client';

export const paymentStatusNameHelper = (paymentStatus: PaymentStatusEnum) => {
  const taskTypeMap: Record<string, string> = {
    [PaymentStatusEnum.NEW]: 'New',
    [PaymentStatusEnum.SENT_INVOICE]: 'Sent Invoice',
    [PaymentStatusEnum.PR1]: 'Payment Reminder 1',
    [PaymentStatusEnum.PR2]: 'Payment Reminder 2',
    [PaymentStatusEnum.PAID]: 'Paid',
    [PaymentStatusEnum.UNPAID]: 'Unpaid',
  };

  let paymentStatusName: string | undefined;

  if (taskTypeMap.hasOwnProperty(paymentStatus)) {
    paymentStatusName = taskTypeMap[paymentStatus];
  }

  return paymentStatusName;
};
