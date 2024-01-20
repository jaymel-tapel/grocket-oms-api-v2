-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
