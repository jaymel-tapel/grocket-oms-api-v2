/*
  Warnings:

  - Added the required column `sessionId` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "sessionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProspectSession" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProspectSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProspectSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
