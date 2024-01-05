/*
  Warnings:

  - Made the column `userId` on table `AlternateEmail` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "LanguageEnum" AS ENUM ('GERMAN', 'ENGLISH');

-- CreateEnum
CREATE TYPE "TierEnum" AS ENUM ('FREE', 'PREMIUM', 'VIP');

-- DropForeignKey
ALTER TABLE "AlternateEmail" DROP CONSTRAINT "AlternateEmail_userId_fkey";

-- AlterTable
ALTER TABLE "AlternateEmail" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "forgot_password_code" TEXT,
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "clientInfoId" INTEGER NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInfo" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "phone" TEXT,
    "sentOffer" BOOLEAN DEFAULT false,
    "hasLoggedIn" BOOLEAN DEFAULT false,
    "thirdPartyId" TEXT,
    "default_unit_cost" DECIMAL(65,30) DEFAULT 0.00,
    "status" "StatusEnum" DEFAULT 'ACTIVE',
    "language" "LanguageEnum" DEFAULT 'GERMAN',
    "tier" "TierEnum" DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientInfoId_key" ON "Client"("clientInfoId");

-- AddForeignKey
ALTER TABLE "AlternateEmail" ADD CONSTRAINT "AlternateEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_clientInfoId_fkey" FOREIGN KEY ("clientInfoId") REFERENCES "ClientInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInfo" ADD CONSTRAINT "ClientInfo_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ClientSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
