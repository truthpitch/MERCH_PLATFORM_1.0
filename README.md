# TruthPitch — Merch Platform

The creator-brand home and curated merch platform for **truthpitch.com**. It's built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Framer Motion, GSAP ScrollTrigger, Lenis, Zustand, Prisma 7 and Auth.js.

- **Phase 1:** the storefront for TruthPitch's own designs (home, shop, product pages, cart, checkout, about, contact).
- **Phase 2:** accounts, a design studio, an admin approval queue, a community marketplace, creator profiles, real orders saved to a database (with gift details), mock print-on-demand fulfillment and order emails.

---

## Run it locally

Requires **Node.js 22 LTS** (Prisma 7 needs ≥ 20.19).

```bash
npm install
```
```bash
cp .env.example .env.local
```
In `.env.local`, set `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Also set `SEED_DEMO_CONTENT=true` if you want demo creators. Then:
```bash
npm run db:migrate
```
```bash
npm run db:seed
```
```bash
npm run dev
```

Open http://localhost:3000 and sign in with your admin email and password to reach `/admin`. Demo creators (`maya@demo.truthpitch.test`, `jordan@demo.truthpitch.test`) use the password `demo-password-123`. Emails (order confirmations, password resets, design decisions) are printed in the terminal running `npm run dev`.

> **About this folder path:** the `&` in `…(CLAUDE CODE, VISUAL STUDIO CODE, GITHUB & HOSTINGER)` breaks npm's command shims on Windows. That's why every script calls `node node_modules/...` directly, and why `better-sqlite3` may fail to install here. If `npm install` skips it, either move the project to a path without `&` (simplest), or run the install from Git Bash with
> `npm_config_script_shell="C:\Program Files\Git\usr\bin\bash.exe" npm install`.
> Hostinger's Linux servers aren't affected.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | `prisma generate` + production build (webpack — see Hostinger notes) |
| `npm run start` | Serve the production build (reads `$PORT`) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create + apply a migration (local SQLite) |
| `npm run db:mysql-migration -- <name>` | Write the matching **MySQL** migration (run after every `db:migrate`) |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Admin user + Phase 1 catalog (+ demo content). Safe to re-run. |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run deploy:build` | `db:deploy` + `db:seed` + `build`, the Hostinger build command |

---

## Deploy to Hostinger (Business Web Hosting, Node.js app from GitHub)

### 1. Create the MySQL database
hPanel → **Databases → Management** → create a database and a user with all privileges. Note the database name, user and password (Hostinger prefixes them, e.g. `u367362408_truthpitch`). The host is `localhost`.

### 2. Create the uploads folder (outside the app)
hPanel → **Files → File Manager**: in your home directory (one level *above* `domains/`), create a folder such as `truthpitch-uploads`. Its full path looks like `/home/u367362408/truthpitch-uploads`. Your username is shown in the File Manager path and in the build log. Uploads stored there survive every redeploy.

### 3. Environment variables
In your Node.js app → **Settings / Environment variables**, add:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://truthpitch.com` |
| `NEXT_PUBLIC_ENABLE_AUTH` | `true` (it was `false` in Phase 1, so change it) |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | `75` |
| `DATABASE_PROVIDER` | `mysql` |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/DATABASE` (URL-encode special characters in the password, e.g. `@` → `%40`) |
| `AUTH_SECRET` | a long random string; generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_TRUST_HOST` | `true` |
| `ADMIN_EMAIL` | your email |
| `ADMIN_PASSWORD` | a strong password (you can remove it after the first deploy) |
| `SEED_DEMO_CONTENT` | `false` |
| `UPLOAD_DIR` | the folder from step 2, e.g. `/home/u367362408/truthpitch-uploads` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional; see "Google sign-in" below |

### 4. Build settings
- **Node version:** 22.x (or 20.x ≥ 20.19)
- **Build command:** `npm run deploy:build`. This applies migrations, seeds the admin and your 12 products (skipping anything that already exists), then builds.
- **Start command:** `npm run start`
- **Output directory:** `.next`

Push to `main` (or click **Redeploy**). Then sign in at `/sign-in` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and open `/admin`.

### If the migration step fails on Hostinger
The build server's older Linux may not run Prisma's migration engine. If the log fails at `prisma migrate deploy`:
1. hPanel → **Databases → phpMyAdmin** → select your database → **SQL** → paste and run the contents of `prisma/mysql/migrations/<timestamp>_init/migration.sql`.
2. Change the build command to `npm run db:seed && npm run build` (no migrate step).
3. For future schema changes, run each new `prisma/mysql/migrations/*/migration.sql` the same way before deploying.

### Google sign-in (optional)
Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web application). Add the authorised redirect URI `https://truthpitch.com/api/auth/callback/google`, and `http://localhost:3000/api/auth/callback/google` for local testing. Put the client ID and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. The "Continue with Google" button appears automatically.

### Why webpack and `next.config.mjs`?
Hostinger's build servers run an older glibc (< 2.29), so Next.js can't load its native compiler and falls back to WebAssembly. That fallback can't run Turbopack or compile `next.config.ts`. Production builds therefore use `next build --webpack` with a plain-JS config. Prisma 7 runs without a native query engine, and production uses the pure-JavaScript `mariadb` driver, so the database layer isn't affected by the old glibc.

---

## How it fits together

```
app/
  (Phase 1)  page.tsx  shop/  cart/  checkout/  about/  contact/
  marketplace/            Approved community designs (type / creator / newest / popular)
  creators/[username]/    Public creator profile
  studio/ studio/[id]/    Design studio: upload → place on mockup → details → submit
  dashboard/              My designs (status badges) · orders · settings
  admin/                  Overview · review queue (approve / reject with reason) · orders · users
  orders/[number]/        Order confirmation (owner, admin, or secret link from the email)
  sign-in/ sign-up/ forgot-password/ reset-password/
  api/auth/[...nextauth]  Auth.js       api/orders    Create order
  api/uploads             Upload image  uploads/[...path]  Serve files from UPLOAD_DIR
auth.ts                   Auth.js config (credentials + Google, JWT sessions, roles)
prisma/schema.prisma      Source-of-truth schema (SQLite). prisma/mysql/ is generated from it.
prisma/seed.ts            Admin + Phase 1 catalog (+ demo content)
lib/
  db.ts                   Prisma client; picks the SQLite or MySQL driver from DATABASE_PROVIDER
  products.ts             Catalog data layer (same signatures as Phase 1, now Prisma)
  session.ts              requireUser / requireAdmin / assertUser / assertAdmin (role read from DB)
  actions/                Server actions: auth, designs, account, admin (all zod-validated + authorised)
  orders.ts               Checkout → Order + OrderItems + GiftDetails → payment → fulfillment → email
  fulfillment.ts          Mock Printful (createOrder, getStatus)
  storage.ts              Upload storage abstraction (local disk now, S3-compatible later)
  email.ts                Email abstraction (console now)
  catalog.ts              Product types, prices, sizes, colours for community designs
```

**Data model:** `User` (role USER/ADMIN), `Design` (DRAFT → PENDING → APPROVED/REJECTED, with a rejection reason), `ProductVariant` (product type × size × colour, price in cents), `Order`, `OrderItem` and `GiftDetails`, plus `Account` (Google) and `PasswordResetToken`. Your Phase 1 products are Designs owned by the admin, so they appear in the shop alongside community designs. The marketplace shows only community designs.

**Security:**
- Every protected page, route handler and server action checks the session on the server, and admin checks re-read the role from the database.
- All inputs are validated with zod, and checkout re-prices every item from the database.
- Uploads are type-checked from file contents (PNG/JPG/WebP only) and capped in size.
- Sign-in, sign-up, password reset, uploads and orders are rate-limited.
- Password-reset tokens are stored hashed, expire after an hour, and work only once.

## Next steps (not built yet)
- Real payments: implement the Stripe adapter in `lib/commerce/providers.ts` and add a webhook.
- Real fulfillment: implement Printful in `lib/fulfillment.ts` and set `fulfillmentVariantId` on variants.
- Real email: implement a provider in `lib/email.ts` (Resend, or SMTP via Hostinger mail).
- Move uploads to S3-compatible storage: implement `StorageDriver` in `lib/storage.ts`.
- Creator payouts / royalties.
