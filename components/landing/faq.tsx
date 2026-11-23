import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "Is it free?",
    answer:
      "Yes. Create, download and email invoices for free. There's no credit card and no trial period.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Every invoice belongs to your signed-in account and is protected by Clerk authentication. Only you can see your invoices.",
  },
  {
    question: "Can I customize invoices?",
    answer:
      "Yes — your business details, client details, line items, tax, discount, currency, notes and terms are all editable.",
  },
  {
    question: "How do I send an invoice?",
    answer:
      "Open any saved invoice and choose Email as PDF, or download a PNG and share it yourself.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-black/10 py-20 sm:py-24 dark:border-white/10"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered."
          description="The things people usually ask before getting started."
          center
        />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-black/10 rounded-2xl border border-black/10 px-6 dark:divide-white/10 dark:border-white/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-black [&::-webkit-details-marker]:hidden dark:text-white">
                {faq.question}
                <Plus className="size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
