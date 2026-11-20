# Invoicer

A simple, modern invoicing app. Users sign in, create invoices, view them, download them as an image, and email them to clients as a PDF — all from the browser.

## Features

- **Landing page** — animated hero with a dot-wave background, responsive on phone, tablet, and desktop.
- **Authentication (Clerk)** — modal sign in / sign up on the landing page plus dedicated `/sign-in` and `/sign-up` pages. After signing in or signing up, the user is taken straight to **Create invoice**.
- **Protected invoice area** — Clerk middleware guards every `/invoices/*` route, and each page/action checks the session again on the server. Invoices can only be created by signed-in users.
- **Create invoice** — bill-from / bill-to details, invoice number, issue & due dates, currency, line items (quantity, rate, tax %), percentage-based discount, notes and terms, with live totals.
- **Invoice list & detail** — browse all invoices and open a full read-only view of any invoice.
- **Download as PNG** — exports a clean, black-and-white invoice image in Geist Mono, generated in the browser.
- **Email as PDF** — sends the invoice to any email address with a PDF attachment via Gmail SMTP (Nodemailer). Marks the invoice as sent, records the activity, and prevents duplicate sends.
- **Dark mode** — theme toggle in the navbar, with styling that adapts across themes.

## Tech stack

| Concern | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | PostgreSQL (Neon serverless) via Prisma 7 + `@prisma/adapter-neon` |
| PDF generation | `pdfkit` |
| Email | `nodemailer` (Gmail SMTP) |
| Theme | `next-themes` |
| Language | TypeScript |

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/sign-in`, `/sign-up` | Clerk auth pages (redirect to `/invoices/new` after success) |
| `/invoices` | List of the signed-in user's invoices |
| `/invoices/new` | Create invoice form |
| `/invoices/[id]` | Invoice detail, with **Send invoice** and **Download invoice** buttons |
| `/dashboard` | Redirects to `/invoices` |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/invoices/new
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/invoices/new

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Gmail SMTP (for sending invoice emails)
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Gmail App Password:** enable 2-Step Verification at https://myaccount.google.com/security, then search "App passwords" and generate one. Use that value (not your normal Gmail password) for `GMAIL_APP_PASSWORD`.

### 3. Set up the database

```bash
npm run db:migrate
```

This applies the migrations in `prisma/migrations` and regenerates the Prisma Client. The datasource is Neon PostgreSQL; update `DATABASE_URL` to point at your own database if needed.

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Regenerate the Prisma Client, then build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate the Prisma Client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:push` | Push the schema directly to the database |
| `npm run db:studio` | Open Prisma Studio |

## Data model

Prisma models in `prisma/schema.prisma`:

- **User** — mirrors a Clerk user, owns businesses, clients, and invoices.
- **Business** — the user's billing details, invoice prefix, and next invoice number.
- **Client** — the person/company being invoiced.
- **Invoice** — number, status (`DRAFT`/`SENT`/etc.), dates, currency, amounts, notes/terms, and JSON snapshots of the from/to details.
- **InvoiceItem** — line items belonging to an invoice.
- **Payment** and **InvoiceActivity** — payments and the invoice's activity timeline.

## Deploying to Vercel

- **Framework Preset:** Next.js
- **Root Directory:** leave blank / default (repository root — `package.json` is at the root)
- **Build Command:** `npm run build` (runs `prisma generate && next build`, which is required because the generated Prisma Client is gitignored)
- **Install Command:** `npm install`
- **Node.js version:** 20.x

Add all the environment variables above in **Project Settings → Environment Variables** before deploying. Auth, database access, and email sending all depend on them.

## Notes

- The generated Prisma client lives in `app/generated/prisma` and is gitignored — always regenerate it (`npm run db:generate`) after changing `prisma/schema.prisma`.
- Invoice emails are sent from `GMAIL_USER`. Gmail's free SMTP has a daily sending limit (~500 emails/day).
- The downloaded PNG and the emailed PDF are generated independently; both read the stored invoice snapshots so the recipient sees the same details as the creator.
