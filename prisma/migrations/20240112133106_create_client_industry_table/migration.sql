-- AlterTable
ALTER TABLE "ClientInfo" ADD COLUMN     "industryId" INTEGER;

-- CreateTable
CREATE TABLE "ClientIndustry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientIndustry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientInfo" ADD CONSTRAINT "ClientInfo_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "ClientIndustry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
