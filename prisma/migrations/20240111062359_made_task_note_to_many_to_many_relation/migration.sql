/*
  Warnings:

  - A unique constraint covering the columns `[userId,taskId]` on the table `TaskNote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TaskNote_taskId_key";

-- DropIndex
DROP INDEX "TaskNote_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TaskNote_userId_taskId_key" ON "TaskNote"("userId", "taskId");
