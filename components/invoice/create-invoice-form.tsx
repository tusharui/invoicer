"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createInvoice,
  type CreateInvoiceState,
} from "@/app/invoices/actions";
import { monoLabelClass as labelClass } from "@/lib/utils";

type Item = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

type Props = {
  defaultIssueDate: string;
  defaultDueDate: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white";

const sectionClass =
  "rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-black dark:shadow-none";

const headingClass =
  "mb-5 text-sm font-semibold tracking-tight text-black dark:text-white";

function newItem(): Item {
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    quantity: "1",
    unitPrice: "0",
    taxRate: "0",
  };
}

function money(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CreateInvoiceForm({ defaultIssueDate, defaultDueDate }: Props) {
  const [state, formAction, isPending] = useActionState<
    CreateInvoiceState,
    FormData
  >(createInvoice, {});
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [discount, setDiscount] = useState("0");

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
    );
    const tax = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity || 0) *
          Number(item.unitPrice || 0) *
          Number(item.taxRate || 0)) /
          100,
      0,
    );
    const discountValue = Math.min(
      Math.max(Number(discount || 0), 0),
      subtotal + tax,
    );
    return {
      subtotal,
      tax,
      discount: discountValue,
      total: subtotal + tax - discountValue,
    };
  }, [items, discount]);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {state.error}
        </div>
      )}

      {/* From / Bill to */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className={sectionClass}>
          <h2 className={headingClass}>From (your business)</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="fromName">
                Business name
              </label>
              <input
                id="fromName"
                name="fromName"
                className={inputClass}
                placeholder="Acme Studio"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fromEmail">
                Email
              </label>
              <input
                id="fromEmail"
                name="fromEmail"
                type="email"
                className={inputClass}
                placeholder="hello@acme.com"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fromAddress">
                Address
              </label>
              <textarea
                id="fromAddress"
                name="fromAddress"
                rows={3}
                className={inputClass}
                placeholder="Street, city, country"
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Bill to</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="clientName">
                Client name <span className="text-red-500">*</span>
              </label>
              <input
                id="clientName"
                name="clientName"
                required
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientCompany">
                Company
              </label>
              <input
                id="clientCompany"
                name="clientCompany"
                className={inputClass}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientEmail">
                Email
              </label>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                className={inputClass}
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientAddress">
                Address
              </label>
              <textarea
                id="clientAddress"
                name="clientAddress"
                rows={3}
                className={inputClass}
                placeholder="Street, city, country"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Details */}
      <section className={sectionClass}>
        <h2 className={headingClass}>Invoice details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="number">
              Invoice number
            </label>
            <input
              id="number"
              name="number"
              className={inputClass}
              placeholder="Auto-generated if blank"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="issueDate">
              Issue date
            </label>
            <input
              id="issueDate"
              name="issueDate"
              type="date"
              required
              defaultValue={defaultIssueDate}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              defaultValue={defaultDueDate}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="currency">
              Currency
            </label>
            <select id="currency" name="currency" defaultValue="USD" className={inputClass}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="discount">
              Discount
            </label>
            <input
              id="discount"
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Items */}
      <section className={sectionClass}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={headingClass + " mb-0"}>Line items</h2>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, newItem()])}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white"
          >
            <Plus className="size-3.5" /> Add item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-black/10 p-4 dark:border-white/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={labelClass}>Item {index + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((entry) => entry.id !== item.id),
                      )
                    }
                    className="text-zinc-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={labelClass}>Description</label>
                  <input
                    required
                    value={item.description}
                    onChange={(event) =>
                      updateItem(item.id, { description: event.target.value })
                    }
                    className={inputClass}
                    placeholder="Web design services"
                  />
                </div>
                <div>
                  <label className={labelClass}>Qty</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, { quantity: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, { unitPrice: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tax %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.taxRate}
                    onChange={(event) =>
                      updateItem(item.id, { taxRate: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <dt>Subtotal</dt>
              <dd>{money(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <dt>Tax</dt>
              <dd>{money(totals.tax)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <dt>Discount</dt>
              <dd>-{money(totals.discount)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold text-black dark:border-white/10 dark:text-white">
              <dt>Total</dt>
              <dd>{money(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Notes & terms */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className={sectionClass}>
          <h2 className={headingClass}>Notes</h2>
          <textarea
            name="notes"
            rows={4}
            className={inputClass}
            placeholder="Thank you for your business!"
          />
        </section>
        <section className={sectionClass}>
          <h2 className={headingClass}>Terms</h2>
          <textarea
            name="terms"
            rows={4}
            className={inputClass}
            placeholder="Payment due within 14 days."
          />
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {isPending ? "Creating…" : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
