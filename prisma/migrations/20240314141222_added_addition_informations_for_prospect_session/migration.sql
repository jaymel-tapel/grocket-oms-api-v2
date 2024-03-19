/*
  Warnings:

  - Added the required column `count` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasWebsites` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyword` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limit` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProspectSession" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "hasWebsites" BOOLEAN NOT NULL,
ADD COLUMN     "keyword" TEXT NOT NULL,
ADD COLUMN     "limit" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL;
