/*
  Warnings:

  - You are about to drop the `ParticipantConversation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `conversationId` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ParticipantConversation" DROP CONSTRAINT "ParticipantConversation_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ParticipantConversation" DROP CONSTRAINT "ParticipantConversation_participantId_fkey";

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "conversationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ParticipantConversation";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
