-- CreateTable
CREATE TABLE "AlternateEmail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AlternateEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlternateEmail_email_key" ON "AlternateEmail"("email") WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "AlternateEmail" ADD CONSTRAINT "AlternateEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
