/*
  Warnings:

  - You are about to alter the column `default_unit_cost` on the `ClientInfo` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,2)`.

*/
-- AlterTable
ALTER TABLE "ClientInfo" ALTER COLUMN "default_unit_cost" SET DATA TYPE DECIMAL(65,2);
