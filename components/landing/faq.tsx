"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "Is it free",
    answer:
      "Yes. Create, download and email invoices for free. There's no credit card and no trial period",
  },
  {
    question: "Is my data safe",
    answer:
      "Every invoice belongs to your signed-in account and is protected by Clerk authentication. Only you can see your invoices",
  },
  {
    question: "Can I customize invoices",
    answer:
      "Yes — your business details, client details, line items, tax, discount, currency, notes and terms are all editable",
  },
  {
    question: "How do I send an invoice",
    answer:
      "Open any saved invoice and choose Email as PDF, or download a PNG and share it yourself",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-black/10 py-20 sm:py-24 dark:border-white/10"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow=""
          title="FAQ"
          titleClassName="text-4xl sm:text-5xl md:text-6xl"
          center
        />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-black/10 rounded-2xl border border-black/10 px-6 dark:divide-white/10 dark:border-white/10">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="py-5">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-2xl font-medium text-black focus-visible:outline-none sm:text-3xl dark:text-white"
                >
                  {faq.question}
                  <Plus
                    className={`size-5 shrink-0 text-zinc-500 transition-transform duration-300 ease-out ${
                      open ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="mt-3 max-w-2xl text-xl leading-8 text-zinc-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
