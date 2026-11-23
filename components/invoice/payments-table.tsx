"use client";

import { useState } from "react";
import { voidPayment } from "@/app/invoices/payment-actions";
import { Money } from "@/components/invoice/money";

type PaymentRow = {
  id: string;
  amount: string;
  method: string;
  status: "RECORDED" | "VOIDED";
  paidAt: string;
  reference: string | null;
  note: string | null;
  voidReason: string | null;
};

type Props = {
  invoiceId: string;
  currency: string;
  payments: PaymentRow[];
  canManage: boolean;
};

function methodLabel(method: string): string {
  return method
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PaymentsTable({ invoiceId, currency, payments, canManage }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onVoid(paymentId: string) {
    const reason = window.prompt("Reason for voiding this payment", "Recorded by mistake");
    if (reason === null) return;
    setBusyId(paymentId);
    setError(null);
    const formData = new FormData();
    formData.set("invoiceId", invoiceId);
    formData.set("paymentId", paymentId);
    formData.set("reason", reason);
    const result = await voidPayment({}, formData);
    if (result.error) setError(result.error);
    setBusyId(null);
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 px-5 py-8 text-sm text-zinc-600 dark:border-white/15 dark:text-zinc-300">
        No payments recorded yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black font-mono text-[10px] uppercase tracking-widest text-white dark:bg-white dark:text-black">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Method</th>
            <th className="px-4 py-3 font-semibold">Reference</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
            {canManage && <th className="px-4 py-3 text-right font-semibold">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {payments.map((payment) => {
            const voided = payment.status === "VOIDED";
            return (
              <tr key={payment.id} className={voided ? "opacity-60" : ""}>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {payment.paidAt}
                  {voided && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-red-500">Voided</span>}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {methodLabel(payment.method)}
                  {payment.note && <div className="text-xs text-zinc-500 dark:text-zinc-400">{payment.note}</div>}
                  {voided && payment.voidReason && <div className="text-xs text-red-500">{payment.voidReason}</div>}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{payment.reference || "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-black dark:text-white">
                  <Money value={voided ? 0 : payment.amount} currency={currency} />
                  {voided && <div className="text-xs text-zinc-500 line-through"><Money value={payment.amount} currency={currency} /></div>}
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    {!voided ? (
                      <button
                        type="button"
                        onClick={() => onVoid(payment.id)}
                        disabled={busyId === payment.id}
                        className="text-xs font-medium text-red-600 underline-offset-4 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        {busyId === payment.id ? "Voiding…" : "Void"}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {error && <p className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}