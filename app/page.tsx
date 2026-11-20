import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { HeroWave } from "@/components/hero-wave";
import { GetStartedButton } from "@/components/get-started-button";

export default function Home() {
  return (
    <HeroWave>
      <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <section className="flex w-full flex-col items-center text-center">
          <span
            className="hero-reveal inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-600 backdrop-blur-sm dark:border-white/20 dark:bg-white/5 dark:text-zinc-300"
            style={{ animationDelay: "0ms" }}
          >
            <AnimatedShinyText className="font-mono text-xs uppercase tracking-widest text-black/70 dark:text-white/80">
              100+ Inovice Generated
            </AnimatedShinyText>
          </span>

          <h1
            className="hero-reveal mt-7 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-black sm:text-5xl lg:text-6xl xl:text-7xl dark:text-white"
            style={{ animationDelay: "50ms" }}
          >
            Get paid faster with beautiful invoices.
          </h1>

          <p
            className="hero-reveal mt-6 max-w-xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300"
            style={{ animationDelay: "100ms" }}
          >
            Create send and track invoices in seconds No spreadsheets no
            awkward follow-ups  just a simpler way to get paid
          </p>

          <div
            className="hero-reveal mt-10 flex w-full max-w-[280px] flex-col items-center justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row"
            style={{ animationDelay: "150ms" }}
          >
            <GetStartedButton />
          </div>
        </section>
      </main>
    </HeroWave>
  );
}
