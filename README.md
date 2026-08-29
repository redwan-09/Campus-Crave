# Campus-Crave

Pre-order + digital token + in-campus delivery platform for Bangladeshi
university canteens. This is a working full-stack app — real database,
real authentication, real role-based access control — not a mockup.

## What's in here

- **Landing / marketing page** — animated hero, how-it-works, interactive
  3-role dashboard preview, pricing, market sizing.
- **Student portal** (`/student`) — browse a canteen's live menu, build a
  cart, checkout (pickup or in-campus delivery), track your token in
  real time.
- **Canteen manager portal** (`/canteen`) — live order queue (Kanban:
  New → Preparing → Ready), menu & stock management, hourly demand
  analytics.
- **Platform admin portal** (`/admin`) — platform-wide stats, canteen
  approvals, suspend/reactivate canteens.
- **FAQ chatbot** — floating widget, rule-based (no external API key
  needed), answers common order/payment/delivery questions.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Vercel's own framework — zero-config deploy |
| Database | PostgreSQL | Reliable, relational, works everywhere |
| ORM | Drizzle ORM | Pure TypeScript, no native binaries — plays perfectly with serverless |
| Auth | Custom JWT (`jose`) + `bcryptjs` | Lightweight, edge-compatible, no vendor lock-in |
| Styling | Tailwind CSS v4 | Design tokens match the brand palette from your logo |
| Fonts | Space Grotesk / Manrope / Hind Siliguri, self-hosted via `@fontsource` | No runtime dependency on Google's font CDN |
| Icons | lucide-react | |
| Data fetching | SWR | Simple polling for "live" order/queue updates |

## Project structure

```
src/
  app/
    page.tsx                 # Landing page
    login/, signup/          # Auth pages
    student/                 # Student portal (layout + pages)
    canteen/                 # Canteen manager portal
    admin/                   # Platform admin portal
    api/                     # All backend routes (see below)
  components/                # UI components, shared across portals
  lib/
    db/schema.ts             # Drizzle schema — single source of truth for the DB
    db/index.ts               # DB connection (pg Pool)
    auth.ts                  # Password hashing, JWT sign/verify
    session.ts                # Server-side session helper
    validators.ts             # Zod schemas for every API input
    constants.ts               # Subscription tiers, delivery fee, formatting
  middleware.ts               # Role-based route protection (Edge runtime)
scripts/
  seed.ts                    # Demo data — 3 roles, 1 active canteen, 8 menu items, sample orders
drizzle/                     # Generated SQL migrations
```

### API routes

| Route | Method | Who | What |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Student or canteen-owner signup |
| `/api/auth/login` | POST | Public | Login (rate-limited) |
| `/api/auth/logout` | POST | Any | Clear session |
| `/api/auth/me` | GET | Any | Current session |
| `/api/canteens` | GET | Public | List active canteens |
| `/api/menu` | GET | Public | Menu for a canteen |
| `/api/menu` | POST | Canteen manager | Add menu item |
| `/api/menu/[id]` | PATCH/DELETE | Canteen manager (own canteen only) | Edit/delete/toggle stock |
| `/api/orders` | GET/POST | Student / Canteen manager | List or place orders |
| `/api/orders/[id]` | GET/PATCH | Owner student / owning canteen | View / advance order status |
| `/api/canteen/stats` | GET | Canteen manager | Own canteen's analytics |
| `/api/admin/stats` | GET | Admin | Platform-wide stats |
| `/api/admin/canteens` | GET | Admin | All canteens |
| `/api/admin/canteens/[id]` | PATCH | Admin | Approve / suspend a canteen |
| `/api/chat` | POST | Public | FAQ chatbot |

Every mutating route validates its input with Zod and checks the
session's role server-side (never trusts the client) — see
`src/middleware.ts` for page-level protection and each route file for
API-level checks.

## Local development

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database (local install, or a free hosted one — see
  deployment section below for options that work well with Vercel)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/campus_crave"
JWT_SECRET="generate-a-long-random-string-here"
```

Generate a strong `JWT_SECRET` with:

```bash
openssl rand -base64 32
```

### 4. Create the database schema

```bash
npm run db:generate   # generates SQL migration files from the schema (already generated once, in /drizzle)
npm run db:migrate    # applies them to your database
```

### 5. Seed demo data (optional but recommended)

```bash
npm run db:seed
```

This creates one account per role, all with password `Demo@1234`:

| Role | Email |
|---|---|
| Student | `student@campuscrave.app` |
| Canteen manager (active canteen) | `canteen@campuscrave.app` |
| Canteen manager (pending canteen — try approving it as admin) | `canteen2@campuscrave.app` |
| Admin | `admin@campuscrave.app` |

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel

### 1. Get a hosted Postgres database

SQLite/local Postgres won't work on Vercel — serverless functions don't
have persistent disk. Pick any of these (all have a free tier that's
more than enough to start):

- **Neon** (neon.tech) — serverless Postgres, very popular with Vercel,
  generous free tier.
- **Vercel Postgres** (powered by Neon) — one-click provision from
  inside your Vercel project dashboard.
- **Supabase** (supabase.com) — Postgres + extras, also has a free tier.

Whichever you choose, copy its connection string — it'll look like
`postgresql://user:password@host/dbname?sslmode=require`.

### 2. Push this project to GitHub

```bash
git init
git add .
git commit -m "Campus-Crave MVP"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Import into Vercel

- Go to vercel.com/new and import the repo.
- Framework preset: Next.js (auto-detected).

### 4. Set environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your hosted Postgres connection string |
| `JWT_SECRET` | A long random string (**different from your local one** — generate a fresh one with `openssl rand -base64 32`) |

### 5. Run migrations against the production database

From your local machine, temporarily point `DATABASE_URL` at your production database and run:

```bash
npm run db:migrate

### 6. Deploy

Push to your main branch — Vercel builds and deploys automatically.

## Important things to know before you go live for real

These are deliberate MVP shortcuts, flagged so nothing surprises you:

- **Payments are in sandbox/demo mode.** Orders are marked `paid`
  immediately on checkout — there's no real bKash/Nagad/Rocket/card
  charge yet. To go live, integrate a payment aggregator like
  SSLCommerz or ShurjoPay (both support bKash/Nagad/Rocket under one
  merchant account) and update the order-creation flow in
  `src/app/api/orders/route.ts` to redirect to their checkout and
  confirm via their webhook before marking `paymentStatus: "paid"`.
- **No in-app wallet with real money.** Issuing an e-wallet that holds
  real money requires a Bangladesh Bank MFS license — well outside MVP
  scope. The "wallet" payment option in the UI is a placeholder; wire it
  to a real aggregator or remove it before launch.
- **The chatbot is rule-based, not AI.** This avoids needing a paid API
  key for an MVP. To upgrade it to a real AI assistant later, add an
  `ANTHROPIC_API_KEY` environment variable and replace the matching
  logic in `src/app/api/chat/route.ts` with a server-side call to
  `https://api.anthropic.com/v1/messages`.
- **Rate limiting on login is in-memory**, which resets on every
  serverless cold start and doesn't share state across function
  instances. Fine for early traffic; swap in Upstash Redis rate limiting
  before you scale.
- **No runner/delivery-assignment flow yet.** Delivery orders capture
  building/floor/room, but assigning and tracking a runner is a next
  milestone, not part of this MVP.
- **Canteen self-registration is open**, gated only by admin approval
  before going live. If you want to restrict who can even submit a
  canteen application, add an invite-code check to
  `src/app/api/auth/register/route.ts`.

## Design tokens

The color palette is derived from your logo (periwinkle-blue dome, cream
plate): see `src/app/globals.css` for the full token list — `ink`,
`periwinkle`, `cream`, `marigold`, `leaf`, `chili`. Typography is Space
Grotesk (display) + Manrope (body) + Hind Siliguri (Bangla text).
