import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CREATE_INVOICE_PATH } from '@/lib/routes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoicer — Invoicing made simple',
  description: 'Create, send, and track beautiful invoices in seconds',
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
            {children}
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
