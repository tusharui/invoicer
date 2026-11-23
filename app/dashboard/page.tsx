import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  CircleAlert,
  CircleDollarSign,
  Clock,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { computeBilling } from "@/lib/invoice-billing";
import { monoLabelClass } from "@/lib/utils";
import { Money } from "@/components/invoice/money";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ReminderAction } from "@/components/dashboard/reminder-action";

export const instant = false;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function snapshotLike(value: unknown): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, v == null ? "" : String(v)]),
    );
  }
  return {};
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function buildRevenueData(
  invoices: Array<{ issueDate: Date; total: unknown; amountPaid: unknown }>,
) {
  const now = new Date();
  const months: Array<{ key: string; label: string; invoiced: number; paid: number }> = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: monthLabel(d), invoiced: 0, paid: 0 });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const inv of invoices) {
    const bucket = byKey.get(monthKey(inv.issueDate));
    if (!bucket) continue;
    bucket.invoiced += toNumber(inv.total);
    bucket.paid += toNumber(inv.amountPaid);
  }
  return months.map(({ label, invoiced, paid }) => ({ label, invoiced, paid }));
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  const invoices = dbUser
    ? await prisma.invoice.findMany({
        where: { userId: dbUser.id },
        include: {
          client: true,
          activities: {
            where: { type: "REMINDER_SENT" },
            orderBy: { createdAt: "desc" },
            select: { id: true, createdAt: true, message: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const computed = invoices.map((invoice) => {
    const billing = computeBilling({
      total: String(invoice.total),
      payments: [{ amount: String(invoice.amountPaid), status: "RECORDED" }],
      currentStatus: invoice.status,
      dueDate: invoice.dueDate,
    });
    return { invoice, billing };
  });

  const active = computed.filter(
    ({ billing }) => billing.status !== "VOID" && billing.status !== "SUPERSEDED",
  );
  const totalInvoiced = active.reduce((sum, { invoice }) => sum + toNumber(invoice.total), 0);
  const totalCollected = active.reduce((sum, { billing }) => sum + billing.amountPaid, 0);
  const outstanding = active.reduce((sum, { billing }) => sum + billing.balanceDue, 0);
  const overdueCount = active.filter(({ billing }) => billing.isOverdue).length;
  const paidCount = active.filter(({ billing }) => billing.status === "PAID").length;
  const revenueData = buildRevenueData(invoices);
  const recent = computed.slice(0, 6);
  const displayCurrency = invoices[0]?.currency ?? "USD";
  const now = new Date();
  const inSevenDays = new Date(now);
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const reminderCandidates = computed
    .filter(({ invoice, billing }) => {
      if (!invoice.lockedAt) return false;
      if (["VOID", "SUPERSEDED", "PAID", "DRAFT"].includes(billing.status)) return false;
      if (billing.balanceDue <= 0) return false;
      const due = new Date(invoice.dueDate);
      return billing.isOverdue || (due >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && due <= inSevenDays);
    })
    .sort((a, b) => {
      if (a.billing.isOverdue !== b.billing.isOverdue) return a.billing.isOverdue ? -1 : 1;
      return new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime();
    });

  const metrics = [
    {
      label: "Total invoiced",
      value: <Money value={totalInvoiced} currency={displayCurrency} />,
      detail: `${active.length} active invoice${active.length === 1 ? "" : "s"}`,
      icon: FileText,
    },
    {
      label: "Collected",
      value: <Money value={totalCollected} currency={displayCurrency} />,
      detail: `${paidCount} paid invoice${paidCount === 1 ? "" : "s"}`,
      icon: CircleDollarSign,
    },
    {
      label: "Outstanding",
      value: <Money value={outstanding} currency={displayCurrency} />,
      detail: outstanding > 0 ? "Balance due across invoices" : "All caught up",
      icon: Wallet,
    },
    {
      label: "Overdue",
      value: String(overdueCount),
      detail: overdueCount > 0 ? "Needs attention" : "No overdue invoices",
      icon: CircleAlert,
      alert: overdueCount > 0,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={monoLabelClass}>Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
            Track invoice performance, payments, and what needs attention
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-base font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          <Plus className="size-4" /> Create invoice
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{metric.label}</p>
                <span
                  className={
                    metric.alert
                      ? "inline-flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "inline-flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                  }
                >
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-black dark:text-white">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="size-5 text-black dark:text-white" />
              <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Reminders</h2>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Overdue and due-soon invoices that may need a reminder
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {reminderCandidates.length} due
          </span>
        </div>

        {reminderCandidates.length === 0 ? (
          <div className="border-t border-black/10 px-5 py-10 text-center dark:border-white/10">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No overdue or due-soon invoices need reminders right now</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 border-t border-black/10 dark:divide-white/5 dark:border-white/10">
            {reminderCandidates.map(({ invoice, billing }) => {
              const lastReminder = invoice.activities[0];
              const to = snapshotLike(invoice.toSnapshot);
              const recipient = invoice.client.email ?? to.email ?? "";
              const dueDate = new Date(invoice.dueDate);
              return (
                <div key={invoice.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/invoices/${invoice.id}`} className="font-medium text-black underline-offset-4 hover:underline dark:text-white">
                        {invoice.number}
                      </Link>
                      <InvoiceStatusBadge status={billing.status} isOverdue={billing.isOverdue} />
                      {!billing.isOverdue && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          Due soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {invoice.client.name} · Due {formatDate(dueDate)} · Balance <Money value={billing.balanceDue} currency={invoice.currency} className="inline font-medium" />
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {lastReminder ? `Last reminded ${formatDateTime(lastReminder.createdAt)}` : "No reminders sent yet"}
                      </span>
                      {invoice.activities.length > 0 && (
                        <details>
                          <summary className="cursor-pointer select-none underline-offset-4 hover:underline">Reminder history ({invoice.activities.length})</summary>
                          <ul className="mt-2 space-y-1 pl-1">
                            {invoice.activities.map((activity) => (
                              <li key={activity.id} className="text-xs text-zinc-600 dark:text-zinc-300">
                                {formatDateTime(activity.createdAt)}{activity.message ? ` · ${activity.message}` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {recipient ? (
                      <ReminderAction invoiceId={invoice.id} defaultEmail={recipient} />
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Add client email to send reminders</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Revenue</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Invoiced vs collected over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-black dark:bg-white" />Invoiced</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />Paid</span>
            </div>
          </div>
          {invoices.length > 0 ? (
            <RevenueChart data={revenueData} />
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-black/10 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              Revenue data will appear after you create invoices
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Payment status</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Current invoice breakdown</p>
          <div className="mt-5 space-y-4">
            {[
              { label: "Paid", count: active.filter(({ billing }) => billing.status === "PAID").length, color: "bg-emerald-500" },
              { label: "Partially paid", count: active.filter(({ billing }) => billing.status === "PARTIALLY_PAID").length, color: "bg-amber-500" },
              { label: "Overdue", count: active.filter(({ billing }) => billing.isOverdue).length, color: "bg-red-500" },
              { label: "Sent / Viewed", count: active.filter(({ billing }) => ["SENT", "VIEWED"].includes(billing.status) && !billing.isOverdue).length, color: "bg-blue-500" },
              { label: "Draft", count: active.filter(({ billing }) => billing.status === "DRAFT").length, color: "bg-zinc-400" },
            ].map((row) => {
              const total = Math.max(active.length, 1);
              const pct = Math.round((row.count / total) * 100);
              return (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-200">{row.label}</span>
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Recent invoices</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Latest activity across your workspace</p>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
          >
            View all invoices <ArrowRight className="size-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="border-t border-black/10 px-6 py-16 text-center dark:border-white/10">
            <h3 className="text-xl font-semibold text-black dark:text-white">No invoices yet</h3>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
              Create your first invoice to see dashboard insights
            </p>
            <Link
              href="/invoices/new"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-base font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
            >
              <Plus className="size-4" /> Create invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {recent.map(({ invoice, billing }) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{invoice.client.name}</td>
                    <td className="px-5 py-4">
                      <InvoiceStatusBadge status={billing.status} isOverdue={billing.isOverdue} />
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{formatDate(invoice.dueDate)}</td>
                    <td className="px-5 py-4 text-right font-medium text-black dark:text-white">
                      <Money value={billing.balanceDue} currency={invoice.currency} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-black dark:text-white">
                      <Money value={invoice.total} currency={invoice.currency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
