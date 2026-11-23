"use client";

import { useActionState, useState } from "react";
import { Check, Mail, Send } from "lucide-react";
import { sendInvoice, type SendInvoiceState } from "@/app/invoices/actions";

type Props = {
  invoiceId: string;
  defaultEmail: string;
  sent: boolean;
  canRemind?: boolean;
};

export function SendInvoiceButton({ invoiceId, defaultEmail, sent, canRemind }: Props) {
  const [state, formAction, isPending] = useActionState<
    SendInvoiceState,
    FormData
  >(sendInvoice, {});
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);

  if (sent && !state.success && !canRemind) {
    return (
      <span className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-6 text-sm font-medium text-black dark:border-white/20 dark:text-white">
        <Check className="size-4" /> Sent
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {!open && !state.success && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-6 text-sm font-semibold text-black transition-colors hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
        >
          <Mail className="size-4" /> {sent || canRemind ? "Send reminder" : "Send invoice"}
        </button>
      )}

      {(open || state.success) && (
        <form action={formAction} className="w-full max-w-sm space-y-2">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          {!state.success && (
            <>
              <label
                htmlFor="sendEmail"
                className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
              >
                Recipient email
              </label>
              <input
                id="sendEmail"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="client@example.com"
                className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base text-black outline-none focus:border-black dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white"
              />
            </>
          )}

          {state.error && (
            <p role="alert" className="text-sm text-red-500">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="text-sm text-green-600 dark:text-green-400">
              {state.success}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            {!state.success && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 rounded-full px-4 text-sm text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              >
                Cancel
              </button>
            )}
            {!state.success && (
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
              >
                <Send className="size-3.5" />
                {isPending ? "Sending…" : "Send"}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
