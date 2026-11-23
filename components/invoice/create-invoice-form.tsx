"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Building2, Plus, Trash2, User } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import {
  createInvoice,
  type CreateInvoiceState,
} from "@/app/invoices/actions";
import { downloadInvoicePng } from "@/components/invoice/download-invoice-button";
import { CREATE_INVOICE_PATH } from "@/lib/routes";
import { monoLabelClass as labelClass } from "@/lib/utils";

type Item = {
  id: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
  taxName: string;
};

type Props = {
  defaultIssueDate: string;
  defaultDueDate: string;
  mode?: "create" | "demo";
};

const DEMO_STORAGE_KEY = "invoicer_demo_generated";

function formatDisplayDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const inputClass =
  "mt-0 w-full rounded-xl border border-black/10 bg-zinc-50/70 px-3 py-2.5 text-base text-black outline-none transition placeholder:text-zinc-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:bg-black";

const sectionClass =
  "rounded-2xl border border-black/10 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-zinc-950";

const headingClass =
  "text-xl font-semibold tracking-tight text-black dark:text-white";

function newItem(): Item {
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    unit: "",
    quantity: "1",
    unitPrice: "0",
    discount: "0",
    taxRate: "0",
    taxName: "",
  };
}

function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CreateInvoiceForm({
  defaultIssueDate,
  defaultDueDate,
  mode = "create",
}: Props) {
  const [state, formAction, isPending] = useActionState<
    CreateInvoiceState,
    FormData
  >(createInvoice, {});
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [discount, setDiscount] = useState("0");
  const [clientType, setClientType] = useState<"individual" | "company">("individual");
  const [issueDate, setIssueDate] = useState(defaultIssueDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [dueTerm, setDueTerm] = useState<number | "custom">(14);
  const [currency, setCurrency] = useState("USD");
  const [showFromDetails, setShowFromDetails] = useState(false);
  const [showBillToDetails, setShowBillToDetails] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoGenerated, setDemoGenerated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function applyDueTerm(days: number | "custom", baseIssueDate = issueDate) {
    setDueTerm(days);
    if (days === "custom") return;
    const base = new Date(`${baseIssueDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + days);
    setDueDate(base.toISOString().slice(0, 10));
  }

  useEffect(() => {
    if (mode !== "demo") return;
    try {
      setDemoGenerated(localStorage.getItem(DEMO_STORAGE_KEY) === "1");
    } catch {
      // Ignore storage access issues; demo still works.
    }
  }, [mode]);

  const totals = useMemo(() => {
    const lineTotals = items.map((item) => {
      const base = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const lineDiscount = Math.min(Math.max(Number(item.discount || 0), 0), Math.max(base, 0));
      const net = base - lineDiscount;
      const tax = (net * Number(item.taxRate || 0)) / 100;
      return { base, lineDiscount, net, tax };
    });
    const subtotal = lineTotals.reduce((sum, l) => sum + l.base, 0);
    const itemDiscount = lineTotals.reduce((sum, l) => sum + l.lineDiscount, 0);
    const tax = lineTotals.reduce((sum, l) => sum + l.tax, 0);
    const discountPercent = Math.min(Math.max(Number(discount || 0), 0), 100);
    const taxableBase = Math.max(subtotal - itemDiscount + tax, 0);
    const discountValue = Math.round(taxableBase * discountPercent) / 100;
    return {
      subtotal,
      itemDiscount,
      tax,
      discountPercent,
      discount: discountValue,
      total: subtotal - itemDiscount + tax - discountValue,
    };
  }, [items, discount]);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function handleDemoDownload() {
    if (mode !== "demo") return;
    setDemoError(null);

    if (demoGenerated) {
      setDemoError("You've already used your free demo invoice. Sign up to create more");
      return;
    }

    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const number = text("number") || "INV-DEMO-001";
    const issueDate = text("issueDate") || defaultIssueDate;
    const dueDate = text("dueDate") || defaultDueDate;
    const currency = text("currency") || "USD";

    const lineItems = items
      .map((item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const base = quantity * unitPrice;
        const lineDiscount = Math.min(Math.max(Number(item.discount || 0), 0), Math.max(base, 0));
        return {
          description: item.description.trim(),
          quantity,
          unitPrice,
          taxRate: Number(item.taxRate || 0),
          lineDiscount,
        };
      })
      .filter((item) => item.description.length > 0);

    if (lineItems.length === 0) {
      setDemoError("Add at least one line item");
      return;
    }

    setDemoBusy(true);
    try {
      await downloadInvoicePng({
        number,
        issueDate: formatDisplayDate(issueDate),
        dueDate: formatDisplayDate(dueDate),
        currency,
        from: {
          name: text("fromName"),
          email: text("fromEmail"),
          addressLine1: text("fromAddress"),
        },
        to: {
          name: text("clientName"),
          company: text("clientCompany"),
          email: text("clientEmail"),
          addressLine1: text("clientAddress"),
        },
        items: lineItems.map((item) => ({
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: item.unitPrice.toFixed(2),
          taxRate: String(item.taxRate),
          amount: (item.quantity * item.unitPrice).toFixed(2),
        })),
        subtotal: totals.subtotal.toFixed(2),
        taxAmount: totals.tax.toFixed(2),
        discountAmount: (totals.itemDiscount + totals.discount).toFixed(2),
        total: totals.total.toFixed(2),
        notes: text("notes") || null,
        terms: text("terms") || null,
      });
      try {
        localStorage.setItem(DEMO_STORAGE_KEY, "1");
      } catch {
        // Ignore storage access issues.
      }
      setDemoGenerated(true);
    } catch (err) {
      setDemoError(
        err instanceof Error ? err.message : "Could not download the invoice. Please try again",
      );
    } finally {
      setDemoBusy(false);
    }
  }


  return (
    <form
      ref={formRef}
      action={mode === "create" ? formAction : undefined}
      onSubmit={mode === "demo" ? (event) => event.preventDefault() : undefined}
      className="space-y-4"
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {state.error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <section className={sectionClass}>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white dark:bg-white dark:text-black">1</span>
                <h2 className={headingClass}>From</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelClass} htmlFor="fromName">Business name</label>
                  <input id="fromName" name="fromName" className={inputClass} placeholder="Acme Studio" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="fromEmail">Email</label>
                  <input id="fromEmail" name="fromEmail" type="email" className={inputClass} placeholder="hello@acme.com" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="fromAddress">Address</label>
                  <input id="fromAddress" name="fromAddress" className={inputClass} placeholder="Street, city, country" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFromDetails((v) => !v)}
                  className="text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
                >
                  {showFromDetails ? "Hide optional details" : "Add optional details"}
                </button>
                {showFromDetails && (
                  <div className="space-y-3 rounded-xl border border-black/5 p-3 dark:border-white/10">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="fromPhone">Phone (optional)</label>
                        <input id="fromPhone" name="fromPhone" className={inputClass} placeholder="+1 555 000 0000" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="fromTaxId">Tax ID (optional)</label>
                        <input id="fromTaxId" name="fromTaxId" className={inputClass} placeholder="GST / VAT / Tax ID" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="fromWebsite">Website (optional)</label>
                      <input id="fromWebsite" name="fromWebsite" className={inputClass} placeholder="https://acme.com" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="fromAddressLine2">Address line 2 (optional)</label>
                      <input id="fromAddressLine2" name="fromAddressLine2" className={inputClass} placeholder="State, postal code, country" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white dark:bg-white dark:text-black">2</span>
                <h2 className={headingClass}>Bill to</h2>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-white/10">
                <button
                  type="button"
                  aria-pressed={clientType === "individual"}
                  onClick={() => setClientType("individual")}
                  className={
                    clientType === "individual"
                      ? "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black shadow-sm dark:bg-black dark:text-white"
                      : "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                  }
                >
                  <User className="size-4" /> Individual
                </button>
                <button
                  type="button"
                  aria-pressed={clientType === "company"}
                  onClick={() => setClientType("company")}
                  className={
                    clientType === "company"
                      ? "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black shadow-sm dark:bg-black dark:text-white"
                      : "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                  }
                >
                  <Building2 className="size-4" /> Company
                </button>
              </div>
              <div className="space-y-3">
                {clientType === "individual" ? (
                  <>
                    <div>
                      <label className={labelClass} htmlFor="clientName">Full name <span className="text-red-500">*</span></label>
                      <input id="clientName" name="clientName" required className={inputClass} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="clientEmail">Email</label>
                      <input id="clientEmail" name="clientEmail" type="email" className={inputClass} placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="clientAddress">Address</label>
                      <textarea id="clientAddress" name="clientAddress" rows={2} className={inputClass} placeholder="Street, city, country" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={labelClass} htmlFor="clientCompany">Company name <span className="text-red-500">*</span></label>
                      <input id="clientCompany" name="clientCompany" required className={inputClass} placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="clientName">Contact person <span className="text-red-500">*</span></label>
                      <input id="clientName" name="clientName" required className={inputClass} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="clientEmail">Email</label>
                      <input id="clientEmail" name="clientEmail" type="email" className={inputClass} placeholder="billing@acme.com" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="clientAddress">Address</label>
                      <textarea id="clientAddress" name="clientAddress" rows={2} className={inputClass} placeholder="Street, city, country" />
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowBillToDetails((v) => !v)}
                  className="text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
                >
                  {showBillToDetails ? "Hide optional details" : "Add optional details"}
                </button>
                {showBillToDetails && (
                  <div className="space-y-3 rounded-xl border border-black/5 p-3 dark:border-white/10">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="clientPhone">Phone (optional)</label>
                        <input id="clientPhone" name="clientPhone" className={inputClass} placeholder="+1 555 000 0000" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="clientTaxId">Tax ID (optional)</label>
                        <input id="clientTaxId" name="clientTaxId" className={inputClass} placeholder="GST / VAT / Tax ID" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white dark:bg-white dark:text-black">3</span>
              <h2 className={headingClass}>Invoice details</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className={labelClass} htmlFor="number">Invoice number</label>
                <input id="number" name="number" className={inputClass} placeholder="Auto" />
              </div>
              <div>
                <label className={labelClass} htmlFor="issueDate">Issue date</label>
                <input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setIssueDate(next);
                    if (dueTerm !== "custom") applyDueTerm(dueTerm, next);
                  }}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 xl:col-span-2">
                <label className={labelClass} htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setDueTerm("custom");
                  }}
                  className={inputClass}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => applyDueTerm(days)}
                      className={
                        dueTerm === days
                          ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
                          : "rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-black dark:border-white/15 dark:text-zinc-300 dark:hover:border-white"
                      }
                    >
                      Net {days}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDueTerm("custom")}
                    className={
                      dueTerm === "custom"
                        ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
                        : "rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-black dark:border-white/15 dark:text-zinc-300 dark:hover:border-white"
                    }
                  >
                    Custom
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="currency">Currency</label>
                <select id="currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="discount">Global discount (%)</label>
                <input id="discount" name="discount" type="number" min="0" max="100" step="0.01" placeholder="0" value={discount} onChange={(event) => setDiscount(event.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="paymentLabel">Payment button label</label>
                <input id="paymentLabel" name="paymentLabel" className={inputClass} placeholder="Pay now" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="paymentUrl">Payment link (optional)</label>
                <input id="paymentUrl" name="paymentUrl" type="url" className={inputClass} placeholder="https://pay.example.com/your-link" />
              </div>
              <div className="sm:col-span-2 xl:col-span-4">
                <label className={labelClass} htmlFor="paymentInstructions">Payment instructions</label>
                <textarea id="paymentInstructions" name="paymentInstructions" rows={2} className={inputClass} placeholder="Bank transfer, UPI, check details, or other payment instructions" />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white dark:bg-white dark:text-black">4</span>
                <h2 className={headingClass}>Items</h2>
              </div>
              <button
                type="button"
                onClick={() => setItems((current) => [...current, newItem()])}
                className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
              >
                <Plus className="size-3.5" /> Add item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-black/10 bg-zinc-50/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove item ${index + 1}`}
                        onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                        className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>Description</label>
                      <input required value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} className={inputClass} placeholder="Web design services" />
                    </div>
                    <div>
                      <label className={labelClass}>Qty</label>
                      <input type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: event.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Price</label>
                      <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: event.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Tax %</label>
                      <input type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={(event) => updateItem(item.id, { taxRate: event.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Unit (optional)</label>
                      <input value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} className={inputClass} placeholder="hrs / pcs / service" />
                    </div>
                    <div>
                      <label className={labelClass}>Item discount (optional)</label>
                      <input type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updateItem(item.id, { discount: event.target.value })} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Tax name (optional)</label>
                      <input value={item.taxName} onChange={(event) => updateItem(item.id, { taxName: event.target.value })} className={inputClass} placeholder="GST / VAT" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className={sectionClass}>
              <h2 className={headingClass + " mb-3"}>Notes</h2>
              <textarea name="notes" rows={3} className={inputClass} placeholder="Thank you for your business" />
            </section>
            <section className={sectionClass}>
              <h2 className={headingClass + " mb-3"}>Terms</h2>
              <textarea name="terms" rows={3} className={inputClass} placeholder="Payment due within 14 days" />
            </section>
          </div>
        </div>

        <div className="space-y-4">
          <section className={sectionClass + " lg:sticky lg:top-4"}>
            <h2 className={headingClass + " mb-4"}>Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <dt>Subtotal</dt>
                <dd className="font-medium text-black dark:text-white">{money(totals.subtotal, currency)}</dd>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <dt>Tax</dt>
                <dd className="font-medium text-black dark:text-white">{money(totals.tax, currency)}</dd>
              </div>
              {totals.itemDiscount > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                  <dt>Item discounts</dt>
                  <dd className="font-medium text-black dark:text-white">-{money(totals.itemDiscount, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <dt>Discount ({totals.discountPercent}%)</dt>
                <dd className="font-medium text-black dark:text-white">-{money(totals.discount, currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-black dark:border-white/10 dark:text-white">
                <dt>Total</dt>
                <dd className="text-xl">{money(totals.total, currency)}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
              {mode === "create" && (
                <label className="mb-4 flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <input type="checkbox" name="saveDefaults" className="mt-0.5 size-4 rounded border-black/20" />
                  <span>Save business details and notes/terms as defaults</span>
                </label>
              )}
              {mode === "demo" ? (
                <button
                  type="button"
                  onClick={handleDemoDownload}
                  disabled={demoBusy || demoGenerated}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-4 text-base font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
                >
                  {demoBusy ? "Preparing…" : demoGenerated ? "Demo used" : "Download demo invoice"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-4 text-base font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
                >
                  {isPending ? "Creating…" : "Create invoice"}
                </button>
              )}
              <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {mode === "demo" ? "No signup required for one demo" : "You can review and send it next"}
              </p>
            </div>
          </section>

          {mode === "demo" && demoError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {demoError}
            </div>
          )}

          {mode === "demo" && demoGenerated && (
            <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-base font-semibold text-black dark:text-white">Demo ready</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Create a free account to save, send, and track invoices</p>
              <div className="mt-3">
                <SignUpButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
                  <button type="button" className="inline-flex h-10 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black">
                    Create free account
                  </button>
                </SignUpButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
