"use client";

import { useActionState, useState } from "react";
import { BellRing, Send, X } from "lucide-react";
import { sendInvoice, type SendInvoiceState } from "@/app/invoices/actions";

type Props = {
  invoiceId: string;
  defaultEmail: string;
};

export function ReminderAction({ invoiceId, defaultEmail }: Props) {
  const [state, formAction, isPending] = useActionState<SendInvoiceState, FormData>(sendInvoice, {});
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);

  if (state.success) {
    return (
      <p role="status" className="text-base font-medium text-emerald-600 dark:text-emerald-400">
        {state.success}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-base font-medium text-black transition-colors hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
      >
        <BellRing className="size-4" /> Send reminder
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="min-w-0 flex-1">
        <label htmlFor={`remind-${invoiceId}`} className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Recipient email
        </label>
        <input
          id={`remind-${invoiceId}`}
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
          className="h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-base text-black outline-none focus:border-black dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-11 items-center justify-center rounded-full px-3 text-base text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
          aria-label="Cancel reminder"
        >
          <X className="size-5" />
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-5 text-base font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          <Send className="size-4" />
          {isPending ? "Sending" : "Send"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="w-full text-base text-red-500 sm:basis-full">
          {state.error}
        </p>
      )}
    </form>
  );
}
