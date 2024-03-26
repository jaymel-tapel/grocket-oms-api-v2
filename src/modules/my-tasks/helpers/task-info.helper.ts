import { TaskTypeEnum } from '@prisma/client';

export const taskTypeNameHelper = (taskType: TaskTypeEnum) => {
  const taskTypeMap: Record<string, string> = {
    [TaskTypeEnum.PR1]: 'Payment Reminder 1',
    [TaskTypeEnum.PR2]: 'Payment Reminder 2',
    [TaskTypeEnum.TWO_MTFU]: '2 Months to Follow Up',
    [TaskTypeEnum.SENT_INVOICE]: 'Sent Invoice',
    [TaskTypeEnum.UNPAID]: 'Unpaid',
  };

  let taskTypeName: string | undefined;

  if (taskTypeMap.hasOwnProperty(taskType)) {
    taskTypeName = taskTypeMap[taskType];
  }

  return taskTypeName;
};

export const newTaskTypeHelper = (taskType: TaskTypeEnum) => {
  const taskTypeMap: Record<string, TaskTypeEnum> = {
    [TaskTypeEnum.SENT_INVOICE]: 'PR1',
    [TaskTypeEnum.PR1]: 'PR2',
  };

  return taskTypeMap[taskType] || 'UNPAID';
};
