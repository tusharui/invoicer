import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { monoLabelClass } from "@/lib/utils";
import { Money } from "@/components/invoice/money";

// Reads the Clerk session (cookies) on every request.
export const instant = false;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function InvoicesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  const invoices = dbUser
    ? await prisma.invoice.findMany({
        where: { userId: dbUser.id },
        include: { client: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={monoLabelClass}>Your workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Invoices
          </h1>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-base font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          <Plus className="size-4" /> Create invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 px-6 py-20 text-center dark:border-white/15">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            No invoices yet
          </h2>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
            Create your first invoice to get started.
          </p>
          <Link
            href="/invoices/new"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-base font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
          >
            <Plus className="size-4" /> Create invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-base">
            <thead className="bg-black font-mono text-[10px] uppercase tracking-widest text-white dark:bg-white dark:text-black">
              <tr>
                <th className="px-5 py-3 font-semibold">Number</th>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Issued</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className=""
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {invoice.client.name}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-black dark:text-white">
                    <Money
                      value={invoice.total}
                      currency={invoice.currency}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
