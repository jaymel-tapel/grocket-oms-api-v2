-- CreateEnum
CREATE TYPE "OrderCreatedByEnum" AS ENUM ('ADMIN', 'ACCOUNTANT', 'SELLER', 'CLIENT');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('NEW', 'SENT_INVOICE', 'PR1', 'PR2', 'PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "OrderEmailTypeEnum" AS ENUM ('BEAUFTRAGT', 'WEITERLEITUNG', 'GESCHEITERT');

-- CreateEnum
CREATE TYPE "OrderReviewStatus" AS ENUM ('NEU', 'BEAUFTRAGT', 'WEITERLEITUNG', 'GESCHEITERT', 'WIDERSPRUCH', 'GELOSCHT');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "order_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" "OrderCreatedByEnum" NOT NULL,
    "send_confirmation" BOOLEAN DEFAULT false,
    "unit_cost" MONEY NOT NULL DEFAULT 0.00,
    "total_price" MONEY NOT NULL DEFAULT 0.00,
    "remarks" TEXT,
    "payment_status" "PaymentStatusEnum" DEFAULT 'NEW',
    "payment_status_date" TIMESTAMP(3),
    "date_paid" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderReview" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "status" "OrderReviewStatus" NOT NULL DEFAULT 'NEU',
    "google_review_id" TEXT,

    CONSTRAINT "OrderReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "by" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "email_type" "OrderEmailTypeEnum",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
