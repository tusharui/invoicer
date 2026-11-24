"use client";

import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { CREATE_INVOICE_PATH } from "@/lib/routes";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  );
}

function SiteHeaderInner() {
  const pathname = usePathname();
  const isAppRoute = pathname === "/dashboard" || pathname.startsWith("/invoices");

  if (isAppRoute) return null;

  return (
    <header className="mx-auto mt-3 flex h-11 w-[calc(100%-1.5rem)] max-w-fit items-center justify-between gap-2 rounded-full border border-black/10 bg-white/80 px-2.5 shadow-sm backdrop-blur-md sm:gap-12 sm:px-4 md:gap-24 lg:gap-48 dark:border-white/15 dark:bg-white/5 dark:shadow-none">
      <span className="shrink-0 whitespace-nowrap pl-1 text-sm font-semibold tracking-tight text-black sm:text-base md:text-xl dark:text-white">
        Invoicer
      </span>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          href="https://github.com/tusharui/invoicer"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Give star on GitHub"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/20 bg-white px-3 text-sm font-medium text-black transition-all duration-200 ease-out hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:border-white dark:focus-visible:ring-white/30"
        >
          <GitHubIcon className="size-4" />
          <span className="hidden sm:inline">Give star on GitHub</span>
          <span className="sm:hidden">Star</span>
        </a>
        <Suspense>
          <Show when="signed-out">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <SignInButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
                <button
                  type="button"
                  className="h-8 cursor-pointer whitespace-nowrap rounded-full border border-black/20 bg-white px-2.5 text-sm font-medium text-black transition-all duration-200 ease-out hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[84px] sm:px-3 sm:text-sm dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:border-white dark:focus-visible:ring-white/30"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
                <button
                  type="button"
                  className="h-8 cursor-pointer whitespace-nowrap rounded-full bg-black px-2.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[84px] sm:px-3 sm:text-sm dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white/30"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </Suspense>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={null}>
      <SiteHeaderInner />
    </Suspense>
  );
}
