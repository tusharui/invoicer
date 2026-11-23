-- CreateEnum
CREATE TYPE "PaymentRecordStatus" AS ENUM ('RECORDED', 'VOIDED');

-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PARTIALLY_PAID';
ALTER TYPE "InvoiceStatus" ADD VALUE 'SUPERSEDED';

-- AlterEnum
ALTER TYPE "InvoiceActivityType" ADD VALUE 'PAYMENT_VOIDED';
ALTER TYPE "InvoiceActivityType" ADD VALUE 'MARKED_PARTIALLY_PAID';
ALTER TYPE "InvoiceActivityType" ADD VALUE 'SUPERSEDED';
ALTER TYPE "InvoiceActivityType" ADD VALUE 'CORRECTION_ISSUED';
ALTER TYPE "InvoiceActivityType" ADD VALUE 'PAYMENT_LINK_UPDATED';

-- AlterTable: payments
ALTER TABLE "payments"
  ADD COLUMN "status" "PaymentRecordStatus" NOT NULL DEFAULT 'RECORDED',
  ADD COLUMN "recordedByUserId" TEXT,
  ADD COLUMN "voidedAt" TIMESTAMP(3),
  ADD COLUMN "voidReason" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: invoices
ALTER TABLE "invoices"
  ADD COLUMN "paymentUrl" TEXT,
  ADD COLUMN "paymentLabel" TEXT,
  ADD COLUMN "lockedAt" TIMESTAMP(3),
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "parentInvoiceId" TEXT,
  ADD COLUMN "supersededByInvoiceId" TEXT,
  ADD COLUMN "supersededAt" TIMESTAMP(3),
  ADD COLUMN "correctionReason" TEXT;

-- CreateTable
CREATE TABLE "invoice_revisions" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "snapshot" JSONB NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invoice_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_invoiceId_status_idx" ON "payments"("invoiceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_supersededByInvoiceId_key" ON "invoices"("supersededByInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_parentInvoiceId_idx" ON "invoices"("parentInvoiceId");

-- CreateIndex
CREATE INDEX "invoice_revisions_invoiceId_createdAt_idx" ON "invoice_revisions"("invoiceId", "createdAt");

-- CreateIndex
CREATE INDEX "invoice_revisions_invoiceId_version_idx" ON "invoice_revisions"("invoiceId", "version");

-- AddForeignKey
ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_parentInvoiceId_fkey"
  FOREIGN KEY ("parentInvoiceId") REFERENCES "invoices"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_supersededByInvoiceId_fkey"
  FOREIGN KEY ("supersededByInvoiceId") REFERENCES "invoices"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_revisions"
  ADD CONSTRAINT "invoice_revisions_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: lock sent/non-draft invoices and normalize balanceDue
UPDATE "invoices"
SET
  "lockedAt" = COALESCE("sentAt", "createdAt"),
  "balanceDue" = GREATEST("total" - "amountPaid", 0),
  "version" = 1
WHERE "status" <> 'DRAFT';

UPDATE "invoices"
SET "balanceDue" = GREATEST("total" - "amountPaid", 0)
WHERE "status" = 'DRAFT';