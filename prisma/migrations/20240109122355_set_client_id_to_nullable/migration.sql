-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_clientId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
