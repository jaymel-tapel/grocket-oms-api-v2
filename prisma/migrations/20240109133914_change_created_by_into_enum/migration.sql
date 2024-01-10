/*
  Warnings:

  - The `createdBy` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CreatedByEnum" AS ENUM ('SELLER', 'ACCOUNTANT', 'AUTO');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" "CreatedByEnum" DEFAULT 'AUTO';
