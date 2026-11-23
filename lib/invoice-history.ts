import { prisma } from "@/lib/prisma";

type SnapshotInvoice = {
  id: string;
  version: number;
  [key: string]: unknown;
};

export async function createInvoiceRevision(params: {
  invoiceId: string;
  version: number;
  action: string;
  reason?: string | null;
  createdById?: string | null;
  snapshot: unknown;
}) {
  return prisma.invoiceRevision.create({
    data: {
      invoiceId: params.invoiceId,
      version: params.version,
      action: params.action,
      reason: params.reason ?? null,
      snapshot: params.snapshot as object,
      createdById: params.createdById ?? null,
    },
  });
}

export function buildInvoiceSnapshot(invoice: SnapshotInvoice) {
  return {
    snapshotVersion: 1,
    capturedAt: new Date().toISOString(),
    invoice,
  };
}