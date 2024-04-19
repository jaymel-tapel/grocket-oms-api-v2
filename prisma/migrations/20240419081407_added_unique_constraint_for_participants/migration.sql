/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,userId]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conversationId,clientId]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participant_conversationId_userId_key" ON "Participant"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_conversationId_clientId_key" ON "Participant"("conversationId", "clientId");
