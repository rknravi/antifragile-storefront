-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "sourceOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "gateway" TEXT NOT NULL,
    "paymentRef" TEXT,
    "razorpayOrderId" TEXT,
    "customerJson" TEXT NOT NULL,
    "shippingJson" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "totalsJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyLedger" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sourceOrderId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "orderTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_sourceOrderId_key" ON "Order"("sourceOrderId");

-- CreateIndex
CREATE INDEX "Review_productSlug_idx" ON "Review"("productSlug");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyLedger_sourceOrderId_key" ON "LoyaltyLedger"("sourceOrderId");

-- CreateIndex
CREATE INDEX "LoyaltyLedger_email_idx" ON "LoyaltyLedger"("email");

