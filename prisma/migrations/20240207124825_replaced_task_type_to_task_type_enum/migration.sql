/*
  Warnings:

  - You are about to drop the column `taskTypeId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskType` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskTypeEnum" AS ENUM ('SENT_INVOICE', 'PR1', 'PR2', 'TWO_MTFU', 'UNPAID');

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskTypeId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskTypeId",
ADD COLUMN     "taskType" "TaskTypeEnum";

-- DropTable
DROP TABLE "TaskType";
