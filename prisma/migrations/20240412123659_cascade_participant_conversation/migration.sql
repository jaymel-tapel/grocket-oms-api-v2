-- DropForeignKey
ALTER TABLE "ParticipantConversation" DROP CONSTRAINT "ParticipantConversation_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ParticipantConversation" DROP CONSTRAINT "ParticipantConversation_participantId_fkey";

-- AddForeignKey
ALTER TABLE "ParticipantConversation" ADD CONSTRAINT "ParticipantConversation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantConversation" ADD CONSTRAINT "ParticipantConversation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
