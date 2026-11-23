import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CreateInvoiceForm } from "@/components/invoice/create-invoice-form";
import { monoLabelClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Try Invoice Demo Invoicer",
  description: "Create and download a sample invoice without signing up",
};

// Reads the current time for default dates.
export const instant = false;

export default async function DemoPage() {
  await connection();

  const today = new Date();
  const due = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={monoLabelClass}>Demo</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Try creating an invoice
          </h1>
          <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
            Fill in the details and download a sample invoice no sign up needed
            Create a free account when you want to save send and track invoices
          </p>
        </div>
        <Link
          href="/"
          className="text-base font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          Back to home
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
        This is a demo Your invoice will be downloaded to your device and will not be saved to an account
      </div>

      <CreateInvoiceForm
        mode="demo"
        defaultIssueDate={today.toISOString().slice(0, 10)}
        defaultDueDate={due.toISOString().slice(0, 10)}
      />
    </main>
  );
}