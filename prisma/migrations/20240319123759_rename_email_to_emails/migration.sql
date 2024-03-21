/*
  Warnings:

  - You are about to drop the column `email` on the `Prospect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "email",
ADD COLUMN     "emails" TEXT[];
