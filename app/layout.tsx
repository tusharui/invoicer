import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
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
          <ClerkProvider>
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 sm:px-6 lg:px-8 dark:border-white/10">
              <span className="text-lg font-semibold tracking-tight text-black sm:text-xl dark:text-white">
                Invoicer
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ThemeToggle />
                <Suspense>
                  <Show when="signed-out">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="h-9 cursor-pointer rounded-full border border-black/20 bg-white px-3 text-xs font-medium text-black transition-all duration-200 ease-out hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[92px] sm:text-sm dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:border-white dark:focus-visible:ring-white/30"
                        >
                          Sign in
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          className="h-9 cursor-pointer rounded-full bg-black px-3 text-xs font-medium text-white transition-all duration-200 ease-out hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:w-[92px] sm:text-sm dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white/30"
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
