"use client";

import { useActionState, useEffect, useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { updatePaymentUrl, type PaymentActionState } from "@/app/invoices/payment-actions";
import { monoLabelClass as labelClass } from "@/lib/utils";

type Props = {
  invoiceId: string;
  paymentUrl: string | null;
  paymentLabel?: string | null;
  paymentInstructions?: string | null;
  disabled?: boolean;
};

const inputClass =
  "mt-0 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white";

export function PaymentLinkCard({ invoiceId, paymentUrl, paymentLabel, paymentInstructions, disabled }: Props) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, isPending] = useActionState<PaymentActionState, FormData>(
    updatePaymentUrl,
    {},
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    if (!paymentUrl) return;
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className={labelClass}>Payment link</p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Add any payment link you already have. When you send the invoice, the client gets a {paymentLabel || "Pay now"} button
      </p>
      {paymentInstructions && (
        <p className="mt-3 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">{paymentInstructions}</p>
      )}

      {paymentUrl ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 text-sm font-medium text-black hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
          >
            <ExternalLink className="size-4" /> Open link
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 text-sm font-medium text-black hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No payment link added</p>
      )}

      {!disabled && (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <div>
            <label className={labelClass} htmlFor="paymentUrl">Payment URL</label>
            <input
              id="paymentUrl"
              name="paymentUrl"
              type="url"
              defaultValue={paymentUrl ?? ""}
              placeholder="https://pay.example.com/your-link"
              className={inputClass}
            />
          </div>
          {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-full bg-black px-4 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {isPending ? "Saving…" : "Save payment link"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}