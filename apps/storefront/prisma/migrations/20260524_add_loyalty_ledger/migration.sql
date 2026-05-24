CREATE TABLE IF NOT EXISTS "LoyaltyLedger" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "sourceOrderId" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "orderTotal" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LoyaltyLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyLedger_sourceOrderId_key"
ON "LoyaltyLedger"("sourceOrderId");

CREATE INDEX IF NOT EXISTS "LoyaltyLedger_email_idx"
ON "LoyaltyLedger"("email");
