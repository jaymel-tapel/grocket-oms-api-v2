/*
  Warnings:

  - You are about to drop the column `auto_send_email` on the `Prospect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "auto_send_email",
ADD COLUMN     "rating" REAL,
ADD COLUMN     "reviews" INTEGER,
ADD COLUMN     "stars" INTEGER[];
