import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { computeBilling } from "@/lib/invoice-billing";
import { monoLabelClass } from "@/lib/utils";
import { DownloadInvoiceButton } from "@/components/invoice/download-invoice-button";
import { SendInvoiceButton } from "@/components/invoice/send-invoice-button";
import { Money } from "@/components/invoice/money";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { RecordPaymentForm } from "@/components/invoice/record-payment-form";
import { PaymentsTable } from "@/components/invoice/payments-table";
import { PaymentLinkCard } from "@/components/invoice/payment-link-card";

// Reads the Clerk session (cookies) on every request.
export const instant = false;

function money(value: unknown): string {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function snapshot(value: unknown): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        entry == null ? "" : String(entry),
      ]),
    );
  }
  return {};
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) notFound();

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: dbUser.id },
    include: {
      items: { orderBy: { position: "asc" } },
      activities: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!invoice) notFound();

  const from = snapshot(invoice.fromSnapshot);
  const to = snapshot(invoice.toSnapshot);
  const billing = computeBilling({
    total: String(invoice.total),
    payments: invoice.payments.map((payment) => ({
      amount: String(payment.amount),
      status: payment.status,
    })),
    currentStatus: invoice.status,
    dueDate: invoice.dueDate,
  });
  const canRecordPayment = !["DRAFT", "VOID", "SUPERSEDED", "PAID"].includes(
    billing.status,
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/invoices"
        className="text-base text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
      >
        ← All invoices
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
              Invoice {invoice.number}
            </h1>
            <InvoiceStatusBadge status={billing.status} isOverdue={billing.isOverdue} />
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
            Issued {formatDate(invoice.issueDate)} · Due{" "}
            {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <SendInvoiceButton
            invoiceId={invoice.id}
            defaultEmail={to.email}
            sent={invoice.status === 'SENT'}
          />
          <DownloadInvoiceButton
            number={invoice.number}
            issueDate={formatDate(invoice.issueDate)}
            dueDate={formatDate(invoice.dueDate)}
            currency={invoice.currency}
            from={{
              name: from.name,
              email: from.email,
              addressLine1: from.addressLine1,
            }}
            to={{
              name: to.name,
              company: to.company,
              email: to.email,
              addressLine1: to.addressLine1,
            }}
            items={invoice.items.map((item) => ({
              description: item.description,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              taxRate: String(item.taxRate),
              amount: String(item.amount),
            }))}
            subtotal={String(invoice.subtotal)}
            taxAmount={String(invoice.taxAmount)}
            discountAmount={String(invoice.discountAmount)}
            total={String(invoice.total)}
            notes={invoice.notes}
            terms={invoice.terms}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <p className={monoLabelClass}>Total</p>
          <p className="mt-3 text-2xl font-semibold text-black dark:text-white">
            <Money value={invoice.total} currency={invoice.currency} />
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <p className={monoLabelClass}>Amount paid</p>
          <p className="mt-3 text-2xl font-semibold text-black dark:text-white">
            <Money value={billing.amountPaid} currency={invoice.currency} />
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <p className={monoLabelClass}>Balance due</p>
          <p className="mt-3 text-2xl font-semibold text-black dark:text-white">
            <Money value={billing.balanceDue} currency={invoice.currency} />
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <p className={monoLabelClass}>
            From
          </p>
          <p className="mt-3 font-medium text-black dark:text-white">
            {from.name || "—"}
          </p>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-300">
            {from.email}
          </p>
          <p className="mt-1 whitespace-pre-line text-base text-zinc-600 dark:text-zinc-300">
            {from.addressLine1}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <p className={monoLabelClass}>
            Bill to
          </p>
          <p className="mt-3 font-medium text-black dark:text-white">
            {to.name || "—"}
          </p>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-300">
            {[to.company, to.email].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 whitespace-pre-line text-base text-zinc-600 dark:text-zinc-300">
            {to.addressLine1}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <PaymentLinkCard
          invoiceId={invoice.id}
          paymentUrl={invoice.paymentUrl}
          disabled={["VOID", "SUPERSEDED"].includes(billing.status)}
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-base">
          <thead className="bg-black font-mono text-[10px] uppercase tracking-widest text-white dark:bg-white dark:text-black">
            <tr>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 text-right font-semibold">Qty</th>
              <th className="px-5 py-3 text-right font-semibold">
                Rate ({invoice.currency})
              </th>
              <th className="px-5 py-3 text-right font-semibold">Tax %</th>
              <th className="px-5 py-3 text-right font-semibold">
                Amount ({invoice.currency})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4 text-black dark:text-white">
                  {item.description}
                </td>
                <td className="px-5 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {String(item.quantity)}
                </td>
                <td className="px-5 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {money(item.unitPrice)}
                </td>
                <td className="px-5 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {String(item.taxRate)}%
                </td>
                <td className="px-5 py-4 text-right font-medium tabular-nums text-black dark:text-white">
                  {money(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto w-full max-w-xs space-y-3 border-t border-black/10 p-5 text-base dark:border-white/10">
          <div className="flex items-baseline justify-between gap-4 text-zinc-600 dark:text-zinc-300">
            <dt>Subtotal</dt>
            <dd>
              <Money value={invoice.subtotal} currency={invoice.currency} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-zinc-600 dark:text-zinc-300">
            <dt>Tax amount</dt>
            <dd>
              <Money value={invoice.taxAmount} currency={invoice.currency} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-zinc-600 dark:text-zinc-300">
            <dt>Discount</dt>
            <dd>
              <Money
                value={-Number(invoice.discountAmount)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-black/10 pt-3 text-base font-semibold text-black dark:border-white/10 dark:text-white">
            <dt>Total</dt>
            <dd>
              <Money
                value={invoice.total}
                currency={invoice.currency}
                className="text-lg"
              />
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-8 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={monoLabelClass}>Payments</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-white">
              Payment history
            </h2>
          </div>
        </div>

        <PaymentsTable
          invoiceId={invoice.id}
          currency={invoice.currency}
          canManage={!["VOID", "SUPERSEDED"].includes(billing.status)}
          payments={invoice.payments.map((payment) => ({
            id: payment.id,
            amount: String(payment.amount),
            method: payment.method,
            status: payment.status,
            paidAt: formatDate(payment.paidAt),
            reference: payment.reference,
            note: payment.note,
            voidReason: payment.voidReason,
          }))}
        />

        <RecordPaymentForm
          invoiceId={invoice.id}
          balanceDue={billing.balanceDue.toFixed(2)}
          currency={invoice.currency}
          defaultPaidAt={new Date().toISOString().slice(0, 10)}
          disabled={!canRecordPayment}
        />
      </section>

      {(invoice.notes || invoice.terms) && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {invoice.notes && (
            <div>
              <p className={monoLabelClass}>
                Notes
              </p>
              <p className="mt-2 whitespace-pre-line text-base text-zinc-600 dark:text-zinc-300">
                {invoice.notes}
              </p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className={monoLabelClass}>
                Terms
              </p>
              <p className="mt-2 whitespace-pre-line text-base text-zinc-600 dark:text-zinc-300">
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
