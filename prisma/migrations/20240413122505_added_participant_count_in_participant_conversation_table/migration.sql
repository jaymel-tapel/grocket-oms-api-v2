/*
  Warnings:

  - Added the required column `participantCount` to the `ParticipantConversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParticipantConversation" ADD COLUMN     "participantCount" INTEGER NOT NULL;
