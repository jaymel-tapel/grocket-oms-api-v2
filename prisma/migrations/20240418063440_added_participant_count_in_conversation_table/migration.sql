/*
  Warnings:

  - Added the required column `participantCount` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "participantCount" INTEGER NOT NULL;
