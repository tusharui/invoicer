ALTER TABLE "invoices"
  ADD COLUMN "referenceNumber" TEXT,
  ADD COLUMN "internalNote" TEXT,
  ADD COLUMN "shippingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "depositAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "taxLabel" TEXT,
  ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recurrenceInterval" TEXT,
  ADD COLUMN "recurrenceEndsAt" DATE;
