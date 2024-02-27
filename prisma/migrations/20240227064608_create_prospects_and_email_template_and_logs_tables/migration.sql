-- CreateTable
CREATE TABLE "Prospect" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "industryId" INTEGER,
    "templateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "url" TEXT,
    "phone" TEXT,
    "note" TEXT,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "ProspectTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "prospectId" INTEGER NOT NULL,
    "template" TEXT NOT NULL,
    "by" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "ProspectLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "ClientIndustry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProspectTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectLog" ADD CONSTRAINT "ProspectLog_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
