import { Check } from "lucide-react";

export type PreviewStatus = "Paid" | "Sent" | "Draft";

export type PreviewItem = {
  description: string;
  qty: string;
  amount: string;
};

export type InvoicePreviewData = {
  number: string;
  status: PreviewStatus;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  issued: string;
  due: string;
  items: PreviewItem[];
  subtotal: string;
  taxLabel: string;
  tax: string;
  total: string;
};

export const DEFAULT_PREVIEW: InvoicePreviewData = {
  number: "INV-0007",
  status: "Paid",
  fromName: "Northline Studio",
  fromEmail: "hello@northline.studio",
  toName: "Acme Co",
  toEmail: "billing@acme.co",
  issued: "Nov 12, 2026",
  due: "Nov 26, 2026",
  items: [
    { description: "Brand identity and logo", qty: "1", amount: "$1,200.00" },
    { description: "Landing page design", qty: "1", amount: "$850.00" },
    { description: "Social media kit", qty: "2", amount: "$300.00" },
  ],
  subtotal: "$2,350.00",
  taxLabel: "Tax 10%",
  tax: "$235.00",
  total: "$2,585.00",
};

const statusClass: Record<PreviewStatus, string> = {
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Sent: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Draft: "border-black/15 bg-black/5 text-zinc-600 dark:border-white/20 dark:bg-white/5 dark:text-zinc-300",
};

/**
 * A realistic invoice shown on the landing page so visitors can see exactly
 * what the product produces before they sign up. Accepts sample data so the
 * same layout can be reused by the interactive gallery further down.
 */
export function InvoicePreview({
  data = DEFAULT_PREVIEW,
}: {
  data?: InvoicePreviewData;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#0c0c0e]">
        <div className="p-5 sm:p-7">
          {/* invoice title + status */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm tracking-[0.22em] text-zinc-400">
                Invoice
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-black dark:text-white">
                {data.number}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium tracking-wide ${statusClass[data.status]}`}
            >
              {data.status === "Paid" ? <Check className="size-3" /> : null}
              {data.status}
            </span>
          </div>

          {/* from / bill to */}
          <div className="mt-7 grid grid-cols-2 gap-5">
            <div>
              <p className="text-base tracking-wide text-black dark:text-white">
                From
              </p>
              <p className="mt-2 text-base font-medium text-black dark:text-white">
                {data.fromName}
              </p>
              <p className="mt-0.5 text-base text-black dark:text-white">
                {data.fromEmail}
              </p>
            </div>
            <div>
              <p className="text-base tracking-wide text-black dark:text-white">
                Bill to
              </p>
              <p className="mt-2 text-base font-medium text-black dark:text-white">
                {data.toName}
              </p>
              <p className="mt-0.5 text-base text-black dark:text-white">
                {data.toEmail}
              </p>
            </div>
          </div>

          {/* dates */}
          <div className="mt-6 flex gap-10 border-y border-black/5 py-3 dark:border-white/5">
            <div>
              <p className="text-base tracking-wide text-black dark:text-white">
                Issued
              </p>
              <p className="mt-1 text-base text-black dark:text-white">
                {data.issued}
              </p>
            </div>
            <div>
              <p className="text-base tracking-wide text-black dark:text-white">
                Due
              </p>
              <p className="mt-1 text-base text-black dark:text-white">
                {data.due}
              </p>
            </div>
          </div>

          {/* line items */}
          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[320px] text-left text-base">
            <thead>
              <tr className="text-base tracking-wide text-black dark:text-white">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {data.items.map((item) => (
                <tr key={item.description}>
                  <td className="py-2.5 text-base text-black dark:text-white">
                    {item.description}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-base text-black dark:text-white">
                    {item.qty}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums text-base text-black dark:text-white">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* totals */}
          <div className="ml-auto mt-5 w-full max-w-[210px] space-y-2 text-base text-black dark:text-white">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{data.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>{data.taxLabel}</span>
              <span className="tabular-nums">{data.tax}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-semibold dark:border-white/10">
              <span>Total</span>
              <span className="tabular-nums">{data.total}</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
