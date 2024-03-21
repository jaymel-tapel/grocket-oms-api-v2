/*
  Warnings:

  - You are about to drop the column `location` on the `ProspectSession` table. All the data in the column will be lost.
  - Added the required column `city` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orig_count` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orig_limit` to the `ProspectSession` table without a default value. This is not possible if the table is not empty.

*/
-- Empty Table
TRUNCATE TABLE "ProspectSession" CASCADE;

-- AlterTable
ALTER TABLE "ProspectSession" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "counter" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "orig_count" INTEGER NOT NULL,
ADD COLUMN     "orig_limit" INTEGER NOT NULL,
ALTER COLUMN "count" DROP NOT NULL,
ALTER COLUMN "limit" DROP NOT NULL;
