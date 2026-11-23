"use client";

import { useActionState, useEffect, useRef } from "react";
import { recordPayment, type PaymentActionState } from "@/app/invoices/payment-actions";
import { monoLabelClass as labelClass } from "@/lib/utils";

type Props = {
  invoiceId: string;
  balanceDue: string;
  currency: string;
  defaultPaidAt: string;
  disabled?: boolean;
};

const inputClass =
  "mt-0 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white";

export function RecordPaymentForm({
  invoiceId,
  balanceDue,
  currency,
  defaultPaidAt,
  disabled,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<PaymentActionState, FormData>(
    recordPayment,
    {},
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (disabled) return null;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
    >
      <h3 className="text-xl font-semibold text-black dark:text-white">Record payment</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Record cash, bank transfer, or any manual payment. Balance updates automatically
      </p>

      <input type="hidden" name="invoiceId" value={invoiceId} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="amount">Amount ({currency})</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            max={balanceDue}
            defaultValue={balanceDue}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="paidAt">Paid date</label>
          <input
            id="paidAt"
            name="paidAt"
            type="date"
            defaultValue={defaultPaidAt}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="method">Method</label>
          <select id="method" name="method" defaultValue="BANK_TRANSFER" className={inputClass}>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CREDIT_CARD">Credit card</option>
            <option value="DEBIT_CARD">Debit card</option>
            <option value="UPI">UPI</option>
            <option value="PAYPAL">PayPal</option>
            <option value="STRIPE">Stripe</option>
            <option value="CHECK">Check</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="reference">Reference</label>
          <input
            id="reference"
            name="reference"
            className={inputClass}
            placeholder="Transaction ID, check no"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass} htmlFor="note">Note</label>
        <input
          id="note"
          name="note"
          className={inputClass}
          placeholder="Optional note"
        />
      </div>

      {state.error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {isPending ? "Recording…" : "Record payment"}
        </button>
      </div>
    </form>
  );
}