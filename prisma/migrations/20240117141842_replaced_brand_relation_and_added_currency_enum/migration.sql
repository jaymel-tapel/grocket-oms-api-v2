/*
  Warnings:

  - You are about to drop the column `userId` on the `Brand` table. All the data in the column will be lost.
  - The `currency` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `clientId` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CurrencyEnum" AS ENUM ('USD', 'EUR');

-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_userId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "userId",
ADD COLUMN     "clientId" INTEGER NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyEnum" NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
