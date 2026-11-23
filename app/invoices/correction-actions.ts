"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildInvoiceSnapshot, createInvoiceRevision } from "@/lib/invoice-history";
import { getUniqueReplacementNumber } from "@/lib/invoice-corrections";

export type CorrectionActionState = {
  error?: string;
};

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function issueCorrection(
  _prev: CorrectionActionState,
  formData: FormData,
): Promise<CorrectionActionState> {
  const invoiceId = text(formData.get("invoiceId"));
  const reason = text(formData.get("reason"));
  if (!invoiceId) return { error: "Invoice not found" };
  if (!reason) return { error: "Please provide a reason for the correction" };

  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { error: "Account not found" };

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: dbUser.id },
    include: { items: { orderBy: { position: "asc" } }, payments: true },
  });
  if (!invoice) return { error: "Invoice not found" };

  if (invoice.status === "DRAFT") {
    return { error: "Draft invoices can be edited directly" };
  }
  if (invoice.status === "SUPERSEDED" || invoice.status === "VOID") {
    return { error: "This invoice cannot be corrected" };
  }

  const hasRecordedPayments = invoice.payments.some((p) => p.status === "RECORDED");
  if (hasRecordedPayments) {
    return {
      error:
        "Invoices with recorded payments cannot be auto replaced Void or reconcile payments manually before issuing a correction",
    };
  }

  let replacementId: string;
  try {
    replacementId = await prisma.$transaction(async (tx) => {
      const fresh = await tx.invoice.findFirst({
        where: { id: invoice.id, userId: dbUser.id },
        include: { items: { orderBy: { position: "asc" } }, payments: true },
      });
      if (!fresh) throw new Error("Invoice not found");

      await tx.invoiceRevision.create({
        data: {
          invoiceId: fresh.id,
          version: fresh.version,
          action: "CORRECTION_ISSUED",
          reason,
          createdById: dbUser.id,
          snapshot: buildInvoiceSnapshot({
            ...fresh,
            total: String(fresh.total),
            subtotal: String(fresh.subtotal),
            taxAmount: String(fresh.taxAmount),
            discountAmount: String(fresh.discountAmount),
            amountPaid: String(fresh.amountPaid),
            balanceDue: String(fresh.balanceDue),
            items: fresh.items.map((i) => ({ ...i, quantity: String(i.quantity), unitPrice: String(i.unitPrice), taxRate: String(i.taxRate), taxAmount: String(i.taxAmount), amount: String(i.amount), discountAmount: String(i.discountAmount) })),
          }) as object,
        },
      });

      const nextVersion = fresh.version + 1;
      const number = await getUniqueReplacementNumber(dbUser.id, fresh.number, nextVersion);

      const replacement = await tx.invoice.create({
        data: {
          userId: fresh.userId,
          businessId: fresh.businessId,
          clientId: fresh.clientId,
          number,
          status: "DRAFT",
          issueDate: fresh.issueDate,
          dueDate: fresh.dueDate,
          currency: fresh.currency,
          subtotal: fresh.subtotal,
          discountAmount: fresh.discountAmount,
          taxAmount: fresh.taxAmount,
          total: fresh.total,
          amountPaid: 0,
          balanceDue: fresh.total,
          notes: fresh.notes,
          terms: fresh.terms,
          paymentInstructions: fresh.paymentInstructions,
          paymentUrl: null,
          paymentLabel: null,
          pdfUrl: null,
          fromSnapshot: fresh.fromSnapshot ?? undefined,
          toSnapshot: fresh.toSnapshot ?? undefined,
          sentAt: null,
          viewedAt: null,
          paidAt: null,
          lockedAt: null,
          version: nextVersion,
          parentInvoiceId: fresh.id,
          correctionReason: null,
          items: {
            create: fresh.items.map((item) => ({
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount,
              taxName: item.taxName,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              amount: item.amount,
              position: item.position,
            })),
          },
          activities: {
            create: {
              type: "CREATED",
              message: `Correction draft created from ${fresh.number}`,
              metadata: { parentInvoiceId: fresh.id, reason },
            },
          },
        },
      });

      await tx.invoice.update({
        where: { id: fresh.id },
        data: {
          status: "SUPERSEDED",
          supersededByInvoiceId: replacement.id,
          supersededAt: new Date(),
          correctionReason: reason,
        },
      });

      await tx.invoiceActivity.create({
        data: {
          invoiceId: fresh.id,
          type: "SUPERSEDED",
          message: `Invoice superseded by ${number}.`,
          metadata: { replacementInvoiceId: replacement.id, reason },
        },
      });
      await tx.invoiceActivity.create({
        data: {
          invoiceId: fresh.id,
          type: "CORRECTION_ISSUED",
          message: `Correction issued ${reason}`,
          metadata: { replacementInvoiceId: replacement.id, reason },
        },
      });

      return replacement.id;
    });
  } catch (error) {
    console.error("Failed to issue correction", error);
    return { error: "Could not issue correction Please try again" };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/invoices/${replacementId}`);
  redirect(`/invoices/${replacementId}`);
}