-- CreateTable
CREATE TABLE "ProspectReviewer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prospectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "google_review_id" TEXT NOT NULL,

    CONSTRAINT "ProspectReviewer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProspectReviewer" ADD CONSTRAINT "ProspectReviewer_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
