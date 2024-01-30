/*
  Warnings:

  - You are about to drop the column `content` on the `TaskNote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdBy" TEXT DEFAULT 'Automated';

-- AlterTable
ALTER TABLE "TaskNote" DROP COLUMN "content",
ADD COLUMN     "note" TEXT;
