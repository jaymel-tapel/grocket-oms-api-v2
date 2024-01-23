-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_clientId_fkey";

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
