<div align="center">

# Invoicer

### Billing but make it breezy

Create Send Track Get paid Look cool doing it

</div>

---

## The Vibe

- **Fast** make an invoice in minutes not in an emotional journey
- **Clean** sharp UI clear totals no clutter
- **Real** auth database payments PDF email analytics the whole grown up stack
- **Fun to use** because boring software should at least have good energy

---

## Vercel Analytics

The app is live and getting traffic Here are the receipts



| Metric last 30 days | Count |
| --- | --- |
| Page views | **528** |
| Unique visitors | **310** |

---

## What Invoicer Can Do

### For everyone
- **Landing page with personality** animated hero product preview features FAQ and a clean flow
- **Try before you sign up demo** create and download one invoice from `/demo` without making an account

### For signed in users
- **Clerk authentication** modal sign in sign up and dedicated auth routes
- **Protected invoice workspace** invoice routes are guarded by Clerk middleware and server side checks
- **Create invoices like a pro** bill from bill to details dates currency line items tax discount notes terms and live totals
- **Invoice list and detail views** browse your invoices and open a full read only invoice page
- **Download as PNG** generate a clean invoice image right in the browser
- **Email as PDF** send invoices with a PDF attachment via Gmail SMTP Nodemailer
- **Payment tracking** record payments track partial payments and keep balance due in check
- **Payment links** add your own payment URL label so clients know where to pay
- **Corrections and revisions** issue invoice corrections and keep history audit context
- **Reminders and overdue flow** nudge late payers and keep invoice status moving
- **Dashboard** see your invoicing world from a higher altitude

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) App Router Turbopack |
| UI | React 19 Tailwind CSS 4 lucide react |
| Auth | [Clerk](https://clerk.com/) |
| Database | PostgreSQL on [Neon](https://neon.tech/) |
| ORM | Prisma 7 + `@prisma/adapter-neon` |
| PDF | `pdfkit` |
| Email | `nodemailer` Gmail SMTP |
| Charts UI bits | Recharts Base UI next themes |
| Analytics | `@vercel/analytics` |
| Language | TypeScript |

---

## Routes

| Route | What happens there |
| --- | --- |
| `/` | Landing page with the big make invoices energy |
| `/demo` | Public demo create download one invoice without signing in |
| `/sign-in` | Clerk sign in page |
| `/sign-up` | Clerk sign up page |
| `/dashboard` | Dashboard view |
| `/invoices` | Your invoice list |
| `/invoices/new` | Create a new invoice |
| `/invoices/[id]` | Invoice detail view send download track payments manage actions |

---

## Getting Started

### 1 Install dependencies

```bash
npm install
```

### 2 Add environment variables

Create a `.env` file in the project root

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..
CLERK_SECRET_KEY=sk_test_..
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

**Gmail App Password tip** enable 2 Step Verification at [Google Account Security](https://myaccount.google.com/security) generate an App Password and use that value for `GMAIL_APP_PASSWORD` Do not use your normal Gmail password unless you enjoy debugging auth errors

### 3 Set up the database

```bash
npm run db:migrate
```

This applies migrations in `prisma/migrations` and regenerates Prisma Client

### 4 Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start invoicing like you mean it

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma Client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate` | Create apply dev migrations |
| `npm run db:push` | Push schema directly to the database |
| `npm run db:studio` | Open Prisma Studio |

---

## Data Model

Prisma models live in `prisma/schema.prisma`

- **User** Clerk backed app user owns businesses clients and invoices
- **Business** billing identity invoice prefix numbering defaults and bank details
- **Client** who gets billed
- **Invoice** the star of the show status dates totals snapshots payment info recurrence corrections supersession
- **InvoiceItem** line items with quantity pricing tax discount and amount
- **Payment** recorded voided payments with method reference and audit fields
- **InvoiceActivity** timeline of invoice events created sent paid reminded etc
- **InvoiceRevision** versioned snapshots for invoice history corrections

---

## Deploying to Vercel

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | Repository root |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Node.js | 20.x |

Add all required environment variables in **Project Settings → Environment Variables** before deploying

> `npm run build` runs `prisma generate && next build` which matters because the generated Prisma Client is gitignored

---

## Notes

- Generated Prisma Client lives in `app/generated/prisma` and is **gitignored** If you change `prisma/schema.prisma` run `npm run db:generate`
- Invoice emails are sent from `GMAIL_USER` Gmail SMTP has daily sending limits so do not try to invoice the entire planet at once
- PNG and PDF outputs are generated independently but both use stored invoice snapshots so the recipient sees the same invoice details

---

<div align="center">



</div>
