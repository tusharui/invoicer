"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeBilling } from "@/lib/invoice-billing";

export type PaymentActionState = {
  error?: string;
  success?: string;
};

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseAmount(value: FormDataEntryValue | null): number {
  const raw = text(value).replace(/,/g, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? round2(parsed) : NaN;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(`${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const PAYMENT_METHODS = new Set([
  "CASH",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "PAYPAL",
  "STRIPE",
  "CHECK",
  "OTHER",
]);

async function getOwnedInvoice(invoiceId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in" as const };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { error: "Account not found" as const };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: dbUser.id },
    include: { payments: true },
  });
  if (!invoice) return { error: "Invoice not found" as const };

  return { dbUser, invoice };
}

function revalidateInvoice(invoiceId: string) {
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function recordPayment(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const invoiceId = text(formData.get("invoiceId"));
  if (!invoiceId) return { error: "Invoice not found" };

  const owned = await getOwnedInvoice(invoiceId);
  if ("error" in owned) return { error: owned.error };
  const { dbUser, invoice } = owned;

  if (["DRAFT", "VOID", "SUPERSEDED"].includes(invoice.status)) {
    return { error: "Payments can only be recorded for sent/active invoices" };
  }

  const amount = parseAmount(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid payment amount greater than 0" };
  }

  const methodRaw = text(formData.get("method")) || "OTHER";
  if (!PAYMENT_METHODS.has(methodRaw)) {
    return { error: "Select a valid payment method" };
  }
  const method = methodRaw as
    | "CASH"
    | "BANK_TRANSFER"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "UPI"
    | "PAYPAL"
    | "STRIPE"
    | "CHECK"
    | "OTHER";

  const paidAt = parseDate(formData.get("paidAt")) ?? new Date();
  const reference = text(formData.get("reference")) || null;
  const note = text(formData.get("note")) || null;

  const currentBilling = computeBilling({
    total: String(invoice.total),
    payments: invoice.payments.map((payment) => ({
      amount: String(payment.amount),
      status: payment.status,
    })),
    currentStatus: invoice.status,
    dueDate: invoice.dueDate,
  });

  if (amount > currentBilling.balanceDue) {
    return {
      error: `Amount exceeds balance due (${currentBilling.balanceDue.toFixed(2)})`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount,
          method,
          status: "RECORDED",
          paidAt,
          reference,
          note,
          recordedByUserId: dbUser.id,
        },
      });

      const payments = await tx.payment.findMany({
        where: { invoiceId: invoice.id },
        select: { amount: true, status: true },
      });

      const billing = computeBilling({
        total: String(invoice.total),
        payments: payments.map((payment) => ({
          amount: String(payment.amount),
          status: payment.status,
        })),
        currentStatus: invoice.status,
        dueDate: invoice.dueDate,
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: billing.amountPaid,
          balanceDue: billing.balanceDue,
          status: billing.status,
          paidAt: billing.status === "PAID" ? (invoice.paidAt ?? paidAt) : null,
        },
      });

      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          type: "PAYMENT_RECEIVED",
          message: `Payment of ${amount.toFixed(2)} recorded via ${method.replace(/_/g, " ")}.`,
          metadata: {
            amount,
            method,
            reference,
            balanceDue: billing.balanceDue,
          },
        },
      });

      if (billing.status === "PAID" && invoice.status !== "PAID") {
        await tx.invoiceActivity.create({
          data: {
            invoiceId: invoice.id,
            type: "MARKED_PAID",
            message: "Invoice marked as paid",
          },
        });
      } else if (
        billing.status === "PARTIALLY_PAID" &&
        invoice.status !== "PARTIALLY_PAID"
      ) {
        await tx.invoiceActivity.create({
          data: {
            invoiceId: invoice.id,
            type: "MARKED_PARTIALLY_PAID",
            message: "Invoice marked as partially paid",
          },
        });
      }
    });

    revalidateInvoice(invoice.id);
    return { success: "Payment recorded" };
  } catch (error) {
    console.error("Failed to record payment", error);
    return { error: "Could not record payment. Please try again" };
  }
}

export async function voidPayment(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const invoiceId = text(formData.get("invoiceId"));
  const paymentId = text(formData.get("paymentId"));
  const reason = text(formData.get("reason")) || "Voided by user";

  if (!invoiceId || !paymentId) return { error: "Payment not found" };

  const owned = await getOwnedInvoice(invoiceId);
  if ("error" in owned) return { error: owned.error };
  const { invoice } = owned;

  if (["VOID", "SUPERSEDED"].includes(invoice.status)) {
    return { error: "Payments cannot be changed on this invoice" };
  }

  const payment = invoice.payments.find((entry) => entry.id === paymentId);
  if (!payment) return { error: "Payment not found" };
  if (payment.status === "VOIDED") return { error: "Payment is already voided" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "VOIDED",
          voidedAt: new Date(),
          voidReason: reason,
        },
      });

      const payments = await tx.payment.findMany({
        where: { invoiceId: invoice.id },
        select: { amount: true, status: true },
      });

      const billing = computeBilling({
        total: String(invoice.total),
        payments: payments.map((entry) => ({
          amount: String(entry.amount),
          status: entry.status,
        })),
        currentStatus: invoice.status,
        dueDate: invoice.dueDate,
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: billing.amountPaid,
          balanceDue: billing.balanceDue,
          status: billing.status,
          paidAt: billing.status === "PAID" ? invoice.paidAt ?? new Date() : null,
        },
      });

      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          type: "PAYMENT_VOIDED",
          message: `Payment of ${Number(payment.amount).toFixed(2)} was voided`,
          metadata: {
            paymentId: payment.id,
            amount: String(payment.amount),
            reason,
            balanceDue: billing.balanceDue,
          },
        },
      });
    });

    revalidateInvoice(invoice.id);
    return { success: "Payment voided" };
  } catch (error) {
    console.error("Failed to void payment", error);
    return { error: "Could not void payment. Please try again" };
  }
}

export async function updatePaymentUrl(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const invoiceId = text(formData.get("invoiceId"));
  if (!invoiceId) return { error: "Invoice not found" };

  const owned = await getOwnedInvoice(invoiceId);
  if ("error" in owned) return { error: owned.error };
  const { invoice } = owned;

  if (["VOID", "SUPERSEDED"].includes(invoice.status)) {
    return { error: "Payment link cannot be changed on this invoice" };
  }

  const raw = text(formData.get("paymentUrl"));
  let paymentUrl: string | null = null;
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return { error: "Enter a valid payment link (https://...)" };
      }
      paymentUrl = url.toString();
    } catch {
      return { error: "Enter a valid payment link (https://...)" };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { paymentUrl },
      });
      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          type: "PAYMENT_LINK_UPDATED",
          message: paymentUrl ? "Payment link updated" : "Payment link removed",
          metadata: { paymentUrl },
        },
      });
    });
    revalidateInvoice(invoice.id);
    return { success: paymentUrl ? "Payment link updated" : "Payment link removed" };
  } catch (error) {
    console.error("Failed to update payment link", error);
    return { error: "Could not update payment link. Please try again" };
  }
}