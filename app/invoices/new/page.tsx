import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CreateInvoiceForm } from "@/components/invoice/create-invoice-form";
import { monoLabelClass } from "@/lib/utils";

// Reads the Clerk session (cookies) on every request.
export const instant = false;

export default async function NewInvoicePage() {
  // Middleware already guards this route; check again on the server.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Opt out of prerendering before reading the current time.
  await connection();

  const today = new Date();
  const due = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-white">
            Create invoice
          </h1>
        </div>
        <Link
          href="/invoices"
          className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/15 dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          All invoices
        </Link>
      </div>

      <CreateInvoiceForm
        defaultIssueDate={today.toISOString().slice(0, 10)}
        defaultDueDate={due.toISOString().slice(0, 10)}
      />
    </main>
  );
}
