import type { InvoiceStatus } from "@/app/generated/prisma/client";

export type InvoiceBillingStatus = InvoiceStatus;

export type BillingPayment = {
  amount: number | string;
  status: "RECORDED" | "VOIDED";
};

export type ComputeBillingInput = {
  total: number | string;
  payments: BillingPayment[];
  currentStatus: InvoiceBillingStatus;
  dueDate: Date | string;
  now?: Date;
};

export type BillingResult = {
  amountPaid: number;
  balanceDue: number;
  status: InvoiceBillingStatus;
  isOverdue: boolean;
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toNumber(value: number | string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const LOCKED_STATUSES: InvoiceBillingStatus[] = ["VOID", "SUPERSEDED"];

export function isInvoiceLockedStatus(status: InvoiceBillingStatus): boolean {
  return LOCKED_STATUSES.includes(status);
}

export function computeBilling(input: ComputeBillingInput): BillingResult {
  const total = round2(Math.max(toNumber(input.total), 0));
  const rawAmountPaid = round2(
    Math.max(
      input.payments
        .filter((payment) => payment.status === "RECORDED")
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0),
      0,
    ),
  );
  const amountPaid = round2(Math.min(rawAmountPaid, total));
  const balanceDue = round2(Math.max(total - amountPaid, 0));
  const dueDate = toDate(input.dueDate);
  const now = startOfDay(input.now ?? new Date());
  const dueDay = startOfDay(dueDate);

  const isOverdue =
    balanceDue > 0 &&
    !isInvoiceLockedStatus(input.currentStatus) &&
    input.currentStatus !== "DRAFT" &&
    dueDay < now;

  let status = input.currentStatus;

  if (!isInvoiceLockedStatus(status) && status !== "DRAFT") {
    if (balanceDue === 0 && total > 0) {
      status = "PAID";
    } else if (amountPaid > 0) {
      // Keep PARTIALLY_PAID even when overdue; overdue is exposed as isOverdue.
      status = "PARTIALLY_PAID";
    } else if (isOverdue) {
      status = "OVERDUE";
    } else if (
      status === "PAID" ||
      status === "PARTIALLY_PAID" ||
      status === "OVERDUE"
    ) {
      // Payments were voided/recomputed and invoice is no longer paid/partial/overdue.
      status = "SENT";
    }
  }

  return { amountPaid, balanceDue, status, isOverdue };
}