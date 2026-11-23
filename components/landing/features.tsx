import {
  Calculator,
  Download,
  FileText,
  Link2,
  LockKeyhole,
  Wallet,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: FileText,
    title: "Try it free",
    description: "Create and download one invoice with no sign up needed",
  },
  {
    icon: Calculator,
    title: "Live totals",
    description: "Subtotal tax shipping and grand total update as you type",
  },
  {
    icon: Link2,
    title: "Your payment link",
    description: "Add your own payment link with a label your clients recognize",
  },
  {
    icon: Wallet,
    title: "Payments and reminders",
    description:
      "Record payments track partial payments and nudge clients who are late",
  },
  {
    icon: Download,
    title: "PNG and PDF",
    description: "Download an image or email a polished PDF to your client",
  },
  {
    icon: LockKeyhole,
    title: "Private workspace",
    description: "Signed in invoices stay yours and only yours",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-black/10 py-20 sm:py-24 dark:border-white/10"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow=""
          title="Everything you need to get paid"
          titleClassName="text-2xl sm:text-4xl md:text-5xl lg:text-6xl sm:whitespace-nowrap"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/10 p-6 transition-colors duration-200 hover:border-black/30 dark:border-white/10"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-black/10">
                  <Icon className="size-5 text-black" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-zinc-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
