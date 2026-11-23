"use client";

import { useState } from "react";
import {
  InvoicePreview,
  type InvoicePreviewData,
} from "@/components/invoice-preview";
import { SectionHeading } from "./section-heading";

const samples: { label: string; data: InvoicePreviewData }[] = [
  {
    label: "Design project",
    data: {
      number: "#INV-0007",
      status: "Paid",
      fromName: "Northline Studio",
      fromEmail: "hello@northline.studio",
      toName: "Acme Co.",
      toEmail: "billing@acme.co",
      issued: "Nov 12, 2026",
      due: "Nov 26, 2026",
      items: [
        { description: "Brand identity & logo", qty: "1", amount: "$1,200.00" },
        { description: "Landing page design", qty: "1", amount: "$850.00" },
        { description: "Social media kit", qty: "2", amount: "$300.00" },
      ],
      subtotal: "$2,350.00",
      taxLabel: "Tax (10%)",
      tax: "$235.00",
      total: "$2,585.00",
    },
  },
  {
    label: "Consulting",
    data: {
      number: "#INV-0012",
      status: "Sent",
      fromName: "Northline Studio",
      fromEmail: "hello@northline.studio",
      toName: "Bright Labs",
      toEmail: "accounts@brightlabs.io",
      issued: "Nov 18, 2026",
      due: "Dec 2, 2026",
      items: [
        { description: "Strategy sessions", qty: "2", amount: "$900.00" },
        { description: "Implementation plan", qty: "1", amount: "$650.00" },
      ],
      subtotal: "$1,550.00",
      taxLabel: "Tax (8%)",
      tax: "$124.00",
      total: "$1,674.00",
    },
  },
  {
    label: "Monthly retainer",
    data: {
      number: "#INV-0013",
      status: "Draft",
      fromName: "Northline Studio",
      fromEmail: "hello@northline.studio",
      toName: "Orbit Coworking",
      toEmail: "finance@orbit.work",
      issued: "Nov 21, 2026",
      due: "Dec 5, 2026",
      items: [
        { description: "Monthly bookkeeping", qty: "1", amount: "$750.00" },
        { description: "Reporting", qty: "1", amount: "$250.00" },
      ],
      subtotal: "$1,000.00",
      taxLabel: "Tax (0%)",
      tax: "$0.00",
      total: "$1,000.00",
    },
  },
];

export function SampleInvoice() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="sample"
      className="scroll-mt-24 border-t border-black/10 py-20 sm:py-24 dark:border-white/10"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Sample invoice"
          title="See exactly what your clients will get."
          description="Click through a few examples. Every invoice you create uses this same clean layout."
          center
        />

        <div className="mt-12">
          <div
            role="tablist"
            aria-label="Sample invoices"
            className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-black/10 p-1.5 dark:border-white/10"
          >
            {samples.map((sample, index) => (
              <button
                key={sample.label}
                type="button"
                role="tab"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/30 ${
                  active === index
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <InvoicePreview data={samples[active].data} />
          </div>
        </div>
      </div>
    </section>
  );
}
