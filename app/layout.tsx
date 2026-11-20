import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { CREATE_INVOICE_PATH } from '@/lib/routes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoicer — Invoicing made simple',
  description: 'Create, send, and track beautiful invoices in seconds.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            signInFallbackRedirectUrl={CREATE_INVOICE_PATH}
            signUpFallbackRedirectUrl={CREATE_INVOICE_PATH}
          >
            <header className="mx-auto mt-3 flex h-11 w-[calc(100%-1.5rem)] max-w-fit items-center justify-between gap-2 rounded-full border border-black/10 bg-white/80 px-2.5 shadow-sm backdrop-blur-md sm:gap-12 sm:px-4 md:gap-24 lg:gap-48 dark:border-white/15 dark:bg-white/5 dark:shadow-none">
              <span className="shrink-0 whitespace-nowrap pl-1 text-sm font-semibold tracking-tight text-black sm:text-base md:text-lg dark:text-white">
                Invoicer
              </span>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <ThemeToggle />
                <Suspense>
                  <Show when="signed-out">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <SignInButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
                        <button
                          type="button"
                          className="h-8 cursor-pointer whitespace-nowrap rounded-full border border-black/20 bg-white px-2.5 text-xs font-medium text-black transition-all duration-200 ease-out hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[84px] sm:px-3 sm:text-sm dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:border-white dark:focus-visible:ring-white/30"
                        >
                          Sign in
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
                        <button
                          type="button"
                          className="h-8 cursor-pointer whitespace-nowrap rounded-full bg-black px-2.5 text-xs font-medium text-white transition-all duration-200 ease-out hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[84px] sm:px-3 sm:text-sm dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white/30"
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
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
