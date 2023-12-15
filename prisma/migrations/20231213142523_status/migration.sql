-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('ACTIVE', 'DELETED', 'BLOCKED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE';
