/*
  Warnings:

  - Added the required column `position` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "position" INTEGER NOT NULL;
