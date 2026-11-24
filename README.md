<div align="center">

# 🧾✨ INVOICER ✨🧾

### *The invoice app that said “no” to boring billing.*

**Create. Send. Track. Get paid. Look cool doing it.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge)](https://clerk.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/tusharanshu18-gmailcoms-projects/invoicer)

<br/>

> **Warning:** Using Invoicer may cause sudden confidence, organized finances, and an uncontrollable urge to send professional PDFs.

</div>

---

## 🎬 Previously on "I Need To Get Paid..."

You finished the work.  
The client is happy.  
And then comes the final boss: **making the invoice**.

Invoicer swoops in like:

```txt
+------------------------------------------------------+
|  [CLIENT WORK DONE]                                  |
|  [INVOICE CREATED]                                   |
|  [PDF SENT]                                          |
|  [PAYMENT TRACKED]                                   |
|  [YOU LOOK UNREASONABLY PROFESSIONAL]                |
+------------------------------------------------------+
```

No spreadsheet spells. No formatting nightmares. Just clean, modern invoicing.

---

## 📊 Vercel Analytics: The Receipts

People aren’t just staring at this repo — they’re actually visiting.

<div align="center">

[![Invoicer Vercel Analytics snapshot](docs/vercel-analytics.svg)](https://vercel.com/tusharanshu18-gmailcoms-projects/invoicer/analytics?tab=total)

</div>

<div align="center">

| 📈 Metric (Last 30 Days) | 🔥 Count |
| --- | ---: |
| 👀 Page Views | **528** |
| 🧍 Unique Visitors | **310** |

</div>

<div align="center">

[**👉 Peek the live Vercel Analytics dashboard**](https://vercel.com/tusharanshu18-gmailcoms-projects/invoicer/analytics?tab=total)

</div>

> Real numbers. Real clicks. Real “wait, this invoice app kinda goes hard” energy.

---

## 🧨 Why Invoicer Slaps

| Boring Billing | Invoicer |
| --- | --- |
| Ugly spreadsheet chaos | Clean invoice flow |
| “Did they pay?” mystery | Payment tracking & status |
| Manual follow-up pain | Reminder/overdue workflow |
| PDF panic | Email PDF + download PNG |
| Lost invoice history | Activities, revisions, corrections |

---

## ✨ Feature Buffet (All You Can Bill)

### 🌍 Public Goodies
- **Landing page with main-character energy** — animated hero, product preview, features, FAQ, the works.
- **Demo mode** — hit `/demo` and create/download one invoice without signing up. Commitment issues? We got you.

### 🔐 Signed-In Superpowers
- **Clerk auth** — smooth sign-in/sign-up, modal or dedicated pages.
- **Protected workspace** — middleware + server-side checks keep invoice routes locked down.
- **Invoice builder** — bill-from/bill-to, dates, currency, line items, tax, discount, notes, terms, live totals.
- **Invoice HQ** — list, open, inspect, and manage invoices like a billing boss.
- **PNG download** — crisp browser-generated invoice image.
- **PDF by email** — send invoices with a PDF attachment through Gmail SMTP.
- **Payments** — record payments, handle partial payments, track balance due.
- **Payment links** — drop in your own “pay me here” link with a friendly label.
- **Corrections & revisions** — fix mistakes without rewriting history like a villain.
- **Reminders & overdue flow** — polite nudges for not-so-polite late payments.
- **Dashboard** — the bird’s-eye view of your money moves.

---

## 🛠️ Tech Stack (The Cool Ingredients)

<div align="center">

| Layer | Weapon of Choice |
| --- | --- |
| 🧠 Framework | Next.js 16 (App Router, Turbopack) |
| 🎨 UI | React 19, Tailwind CSS 4, lucide-react, Base UI |
| 🔑 Auth | Clerk |
| 🗄️ Database | PostgreSQL on Neon |
| 🔗 ORM | Prisma 7 + `@prisma/adapter-neon` |
| 📄 PDF | pdfkit |
| 📬 Email | nodemailer (Gmail SMTP) |
| 📈 Charts/Extras | Recharts, next-themes |
| 📡 Analytics | @vercel/analytics |
| 🧾 Language | TypeScript |

</div>

---

## 🗺️ Where To Go

| Route | The Adventure |
| --- | --- |
| `/` | The shiny landing page |
| `/demo` | Try it with zero commitment |
| `/sign-in` | Enter the invoicing dojo |
| `/sign-up` | Become an invoicing legend |
| `/dashboard` | Big-picture billing vibes |
| `/invoices` | Your invoice command center |
| `/invoices/new` | Birth a fresh invoice |
| `/invoices/[id]` | The invoice detail cockpit |

---

## ⚡ Quickstart (Speedrun Any%)

### 1) Grab the goods

```bash
npm install
```

### 2) Feed the `.env` beast

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

> 🧪 **Pro tip:** Use a Gmail App Password, not your real Gmail password. Your future self will thank you.

### 3) Summon the database

```bash
npm run db:migrate
```

### 4) Launch

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and make your first invoice feel important.

---

## 🎮 Command Cheat Codes

| Command | Effect |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma Client + production build |
| `npm run start` | Run production server |
| `npm run lint` | Lint check |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate` | Create/apply dev migration |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Prisma Studio |

---

## 🧠 Data Model Lore

The database schema lives in `prisma/schema.prisma`. Here’s the cast:

- **User** — the Clerk-backed hero.
- **Business** — your billing identity, defaults, prefix/numbering, bank details.
- **Client** — the person/company receiving the “please pay me” masterpiece.
- **Invoice** — statuses, dates, totals, snapshots, payment info, recurrence, corrections/supersession.
- **InvoiceItem** — line items with quantity, pricing, tax, discount, amount.
- **Payment** — recorded/voided payments with method, reference, audit fields.
- **InvoiceActivity** — timeline receipts: created, sent, viewed, paid, reminded, etc.
- **InvoiceRevision** — version history for when invoices evolve.

---

## ☁️ Deploy to Vercel (Go Live Mode)

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | repo root |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Node.js | 20.x |

Add your env vars in **Vercel Project Settings → Environment Variables** before deploying.

> Build command includes `prisma generate && next build` because the generated Prisma client is gitignored. Skip it and chaos ensues.

---

## 🧯 Field Notes

- `app/generated/prisma` is gitignored. Change schema? Run `npm run db:generate`.
- Emails come from `GMAIL_USER`. Gmail SMTP has daily limits — pace your invoice empire.
- PNG and PDF outputs are generated separately, but both read stored invoice snapshots so what you see is what they get.

---

## 🤘 Wanna Contribute?

Bring ideas. Bring fixes. Bring chaotic-good energy.

```bash
# the sacred ritual
git checkout -b cool-new-thing
# make magic
git commit -m "feat: add something ridiculously useful"
# open PR
```

---

<div align="center">

## 🏆 Final Score

**Spreadsheets:** 0  
**Invoicer:** 1  
**Your sanity:** recovering nicely

<br/>

### Made with TypeScript, caffeine, and a healthy fear of ugly invoices.

**If this README made you smile, imagine what the app does.**

</div>