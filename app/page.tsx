import { GetStartedButton } from "@/components/get-started-button";
import { InvoicePreview } from "@/components/invoice-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { SampleInvoice } from "@/components/landing/sample-invoice";
import { Faq } from "@/components/landing/faq";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pt-8 pb-16 sm:px-8 sm:pt-10 lg:pt-12">
        <div className="grid w-full items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1
              className="hero-reveal text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-black sm:text-5xl lg:text-6xl dark:text-white"
              style={{ animationDelay: "50ms" }}
            >
              Create and send professional invoices in minutes.
            </h1>

            <p
              className="hero-reveal mt-6 max-w-xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300"
              style={{ animationDelay: "100ms" }}
            >
              Create professional invoices in minutes and share them with your
              clients effortlessly. Track payments and keep everything organized
              in one place. Simple billing without the extra hassle.
            </p>

            <div
              className="hero-reveal mt-10 flex w-full max-w-[280px] flex-col items-center justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row lg:items-start"
              style={{ animationDelay: "150ms" }}
            >
              <GetStartedButton />
            </div>

            <p
              className="hero-reveal mt-4 font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
              style={{ animationDelay: "200ms" }}
            >
              Free to start · No credit card required
            </p>
          </section>

          {/* Product visual */}
          <div
            className="hero-reveal w-full"
            style={{ animationDelay: "200ms" }}
          >
            <InvoicePreview />
          </div>
        </div>
      </main>

      <HowItWorks />
      <Features />
      <SampleInvoice />
      <Faq />
      <SiteFooter />
    </>
  );
}
