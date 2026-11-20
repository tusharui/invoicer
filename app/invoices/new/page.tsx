import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateInvoiceForm } from "@/components/invoice/create-invoice-form";
import { monoLabelClass } from "@/lib/utils";

// Reads the Clerk session (cookies) on every request.
export const instant = false;

export default async function NewInvoicePage() {
  // Middleware already guards this route; check again on the server.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const today = new Date();
  const due = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={monoLabelClass}>Invoices</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Create invoice
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
            Fill in the details below and your invoice will be saved to your
            account.
          </p>
        </div>
        <Link
          href="/invoices"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          View all invoices
        </Link>
      </div>

      <CreateInvoiceForm
        defaultIssueDate={today.toISOString().slice(0, 10)}
        defaultDueDate={due.toISOString().slice(0, 10)}
      />
    </main>
  );
}
