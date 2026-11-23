import { Calculator, FileText, FolderCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Add your details",
    description:
      "Enter your business and client details, invoice number, and dates. Notes and terms go here too",
  },
  {
    number: "02",
    icon: Calculator,
    title: "Build & download",
    description:
      "Add line items with quantity, rate and tax. Watch the total update live, then download your invoice instantly",
  },
  {
    number: "03",
    icon: FolderCheck,
    title: "Save & track",
    description:
      "Create a free account to save invoices, send them by email, and keep everything organized in one place",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-black/10 py-20 sm:py-24 dark:border-white/10"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From blank page to sent in three steps"
          description="No setup call, no templates to wrestle with. Just the fields you need and a clean invoice at the end"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl border border-black/10 p-6 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400">
                    {step.number}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10">
                    <Icon className="size-5 text-white" />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
