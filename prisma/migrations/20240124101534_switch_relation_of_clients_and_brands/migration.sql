/*
  Warnings:

  - You are about to drop the column `clientId` on the `Brand` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_clientId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "ClientInfo" ADD COLUMN     "brandId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "ClientInfo" ADD CONSTRAINT "ClientInfo_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
