/*
  Warnings:

  - The `email` column on the `Prospect` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "email",
ADD COLUMN     "email" TEXT[];
