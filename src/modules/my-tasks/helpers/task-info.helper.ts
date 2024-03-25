import { TaskTypeEnum } from '@prisma/client';

export const taskTypeNameHelper = (taskType: TaskTypeEnum) => {
  const taskTypeEnum = TaskTypeEnum;

  const taskTypeMap: Record<string, string> = {
    [taskTypeEnum.PR1]: 'Payment Reminder 1',
    [taskTypeEnum.PR2]: 'Payment Reminder 2',
    [taskTypeEnum.TWO_MTFU]: '2 Months to Follow Up',
    [taskTypeEnum.SENT_INVOICE]: 'Sent Invoice',
    [taskTypeEnum.UNPAID]: 'Unpaid',
  };

  let taskTypeName: string | undefined;

  if (taskTypeMap.hasOwnProperty(taskType)) {
    taskTypeName = taskTypeMap[taskType];
  }

  return taskTypeName;
};
