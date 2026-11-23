"use client";

import { useActionState, useState } from "react";
import { issueCorrection, type CorrectionActionState } from "@/app/invoices/correction-actions";

type Props = {
  invoiceId: string;
  disabled?: boolean;
};

export function IssueCorrectionDialog({ invoiceId, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<CorrectionActionState, FormData>(
    issueCorrection,
    {},
  );

  if (disabled) return null;

  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-black dark:text-white">Need to correct this invoice</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Sent invoices are locked. Issue a replacement draft and keep the original record
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
        >
          {open ? "Cancel" : "Issue correction"}
        </button>
      </div>

      {open && (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <div>
            <label className="mb-1 block text-base font-medium text-black dark:text-white" htmlFor="reason">
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              required
              rows={3}
              placeholder="Explain what needs to be corrected"
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white"
            />
          </div>
          {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-full bg-black px-4 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {isPending ? "Creating replacement…" : "Create replacement draft"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}