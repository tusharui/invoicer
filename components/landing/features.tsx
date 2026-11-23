import {
  Calculator,
  ImageDown,
  LockKeyhole,
  Mail,
  Moon,
  Percent,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: Calculator,
    title: "Live totals",
    description:
      "Subtotal, tax and grand total recalculate as you type — no calculator needed.",
  },
  {
    icon: Percent,
    title: "Tax & discounts",
    description:
      "Set a tax rate on each item and apply a percentage discount to the whole invoice.",
  },
  {
    icon: ImageDown,
    title: "One-click PNG",
    description:
      "Download a clean invoice image to share in a chat, a report, or anywhere else.",
  },
  {
    icon: Mail,
    title: "Email as PDF",
    description:
      "Send a polished PDF straight to your client's inbox without leaving the app.",
  },
  {
    icon: Moon,
    title: "Dark mode",
    description:
      "Follows your system theme, or switch whenever you like from the navbar.",
  },
  {
    icon: LockKeyhole,
    title: "Private workspace",
    description:
      "Invoices are tied to your signed-in account and can't be seen by anyone else.",
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
          eyebrow="Features"
          title="Everything you need. Nothing you don't."
          description="The small details that make an invoice look professional, without the bloat of a full accounting suite."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/10 p-6 dark:border-white/10"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10">
                  <Icon className="size-5 text-black dark:text-white" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-black dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
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
