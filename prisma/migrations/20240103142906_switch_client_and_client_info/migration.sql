/*
  Warnings:

  - You are about to drop the column `clientInfoId` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `ClientInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `ClientInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_clientInfoId_fkey";

-- DropIndex
DROP INDEX "Client_clientInfoId_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "clientInfoId";

-- AlterTable
ALTER TABLE "ClientInfo" ADD COLUMN     "clientId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClientInfo_clientId_key" ON "ClientInfo"("clientId");

-- AddForeignKey
ALTER TABLE "ClientInfo" ADD CONSTRAINT "ClientInfo_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
