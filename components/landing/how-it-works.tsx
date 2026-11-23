import { SectionHeading } from "./section-heading";

const steps = [
  {
    number: "01",
    title: "Add your details",
    description:
      "Enter your business and client details invoice number and dates Notes and terms go here too",
  },
  {
    number: "02",
    title: "Build and download",
    description:
      "Add line items with quantity rate and tax Watch the total update live then download your invoice instantly",
  },
  {
    number: "03",
    title: "Save and track",
    description:
      "Create a free account to save invoices send them by email and keep everything organized in one place",
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
          eyebrow=""
          title="How it works"
          titleClassName="text-5xl sm:text-6xl md:text-7xl"
        />

        <div className="mt-14 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group grid gap-3 py-8 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-4 sm:py-10 md:gap-6"
            >
              <div className="flex items-start">
                <span className="-mt-2 font-mono text-8xl font-semibold leading-none tracking-tight text-black sm:-mt-3 sm:text-9xl md:-mt-4 md:text-[10rem] dark:text-white">
                  {step.number}
                </span>
              </div>

              <div className="max-w-2xl sm:pt-2 md:pt-3">
                <h3 className="text-3xl font-medium tracking-tight text-black sm:text-4xl md:text-5xl dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-300">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
