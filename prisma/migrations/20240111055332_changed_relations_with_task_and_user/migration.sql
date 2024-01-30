/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `TaskAccountant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TaskNote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taskId]` on the table `TaskNote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taskId]` on the table `TaskSeller` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TaskNote" DROP CONSTRAINT "TaskNote_userId_fkey";

-- DropIndex
DROP INDEX "TaskNote_userId_taskId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TaskAccountant_taskId_key" ON "TaskAccountant"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskNote_userId_key" ON "TaskNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskNote_taskId_key" ON "TaskNote"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSeller_taskId_key" ON "TaskSeller"("taskId");

-- AddForeignKey
ALTER TABLE "TaskNote" ADD CONSTRAINT "TaskNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
