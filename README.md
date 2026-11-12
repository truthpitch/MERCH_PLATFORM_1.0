# TruthPitch — Merch Platform (Phase 1)

A creator-brand home and merch store for **truthpitch.com**. It's built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Framer Motion, GSAP ScrollTrigger, Lenis and Zustand.

Phase 1 is the storefront for TruthPitch's own designs. Phase 2 (accounts, user-submitted designs, admin approval and a database) plugs into the seams described below.

---

## Run it locally

Requires **Node.js 20.9+** (Node 22 LTS recommended).

```bash
npm install
cp .env.example .env.local   # optional — defaults work out of the box
npm run dev                  # http://localhost:3000
```

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Dev server with hot reload (Turbopack)     |
| `npm run build`     | Production build (webpack — see note below) |
| `npm run start`     | Serve the production build (uses `$PORT`)  |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TS)      |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`  |

> **Why the scripts call `node node_modules/...` directly:** this project folder's path contains `&` and parentheses. On Windows, those characters break npm's `.bin` command shims. Calling Node directly works everywhere, including Hostinger's Linux servers.

---

## Deploy to Hostinger (Business Web Hosting → Node.js app from GitHub)

The app uses a plain `next build` / `next start` setup with no Vercel-only features.

1. **Push to GitHub.** Create a repository and push this folder. `.gitignore` already excludes `node_modules`, `.next` and `.env*` (but keeps `.env.example`).
   ```bash
   git init
   ```
   ```bash
   git add . && git commit -m "TruthPitch merch platform — phase 1"
   ```
   ```bash
   git branch -M main && git remote add origin https://github.com/<you>/<repo>.git && git push -u origin main
   ```
2. **Create the app in hPanel.** Go to **Websites → Add website → Node.js Apps**, choose **Import Git repository**, authorise GitHub and pick the repo and branch (`main`).
3. **Build settings.** Hostinger usually detects Next.js. If it doesn't, enter:
   - **Node version:** 22.x (20.x also works)
   - **Install command:** `npm ci` (or `npm install`)
   - **Build command:** `npm run build`
   - **Start command:** `npm run start`
   - **Output directory:** `.next`
   - **Entry/port:** leave the default. `next start` reads the `PORT` variable that Hostinger provides.
4. **Environment variables.** Add the values from `.env.example` in the app's settings. At minimum, set:
   - `NEXT_PUBLIC_SITE_URL=https://truthpitch.com`
   - `NEXT_PUBLIC_ENABLE_AUTH=false`

   `NEXT_PUBLIC_*` values are baked in at build time, so **redeploy after you change them**.
5. **Deploy**, then connect the `truthpitch.com` domain and enable SSL in hPanel.
6. **Redeploys.** Each push to the connected branch triggers a new build. If that isn't happening, click **Redeploy**.

Notes:
- **Why `next build --webpack` and `next.config.mjs`:** Hostinger's build servers run an older glibc (< 2.29), so Next.js can't load its native compiler and falls back to WebAssembly. That fallback can't run Turbopack or compile a TypeScript `next.config.ts`, so production builds use webpack and the config is plain JavaScript. Local `npm run dev` still uses Turbopack.
- `next/font/google` downloads Poppins at **build time**. Hostinger's build servers have internet access, so no action is needed.
- Image optimisation runs on the Node server (`sharp` is installed automatically with Next.js). Remote images are allowed from `images.unsplash.com` in `next.config.mjs`. Add your own CDN host there when you replace the placeholders.

---

## Project structure

```
app/                 Routes (App Router)
  page.tsx           Home
  shop/              Shop grid + /shop/[slug] product detail
  cart/ checkout/    Cart page, mocked multi-step checkout
  about/ contact/    Brand story, contact form + FAQ
  api/orders         POST → validates OrderDraft, re-prices, mock pay + fulfil
  api/contact        POST → validates contact form (mock)
  api/newsletter     POST → validates signup (mock)
  sitemap.ts robots.ts opengraph-image.tsx icon.svg
components/
  layout/            Navbar, MobileMenu, Footer, Cursor, SmoothScroll, PageTransition, AppShell
  home/              Preloader, Hero, LatestDrop (GSAP pin), Manifesto, BestSellers, …
  product/ shop/     ProductCard, Gallery + lightbox, Purchase, SizeGuide, ShopView, Filters
  cart/ checkout/    CartDrawer, CartLine, CartView, CheckoutFlow, OrderSummary
  ui/                Button, Magnetic, AnimatedText, MediaReveal, Marquee, Dialog, Accordion, Field…
data/products.ts     Mock catalog (12 products) — ONLY imported by lib/products.ts
lib/
  products.ts        Data layer: getProducts(filters), getProductBySlug, getRelatedProducts…
  filters.ts         Pure filter/sort logic (shared client + server)
  variants.ts        Variant ids / derivation (size × colour)
  pricing.ts         Shipping methods + totals (shared client + server)
  orders.ts          createOrder(): OrderDraft → Order (server-side re-pricing)
  commerce/providers.ts  PaymentProvider / FulfillmentProvider interfaces + mocks
  schemas.ts         Zod schemas used by forms AND API routes
  site.ts            Brand config, socials, feature flags
store/cart.ts        Zustand cart (persisted to localStorage)
types/               Product, ProductVariant, CartItem, Order, GiftDetails, Address…
```

## Design system

- **Font:** Poppins via `next/font/google`. Weight 700 for display text, 400/500 for body.
- **Tokens:** defined in `app/globals.css` as Tailwind 4 `@theme` colours (`navy`, `accent`, `brown`, `sand`, `paper`, `white`) and mirrored as `--tp-*` CSS variables.
- **Motion:** every animation uses transform or opacity. `MotionConfig reducedMotion="user"`, a global CSS media query and per-feature checks honour `prefers-reduced-motion`. With reduced motion on, Lenis, the custom cursor, magnetic pull, parallax, GSAP pinning and the preloader are all disabled.

---

## Phase 2 hooks (already in place)

| Need                         | Where                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Swap mock data for a DB      | Rewrite the function bodies in `lib/products.ts`. Pages call only these functions.          |
| DB-shaped models             | `types/` — `Product`, `ProductVariant`, `Order`, `OrderItem`, `GiftDetails`, `Address`      |
| User-submitted designs       | `Product.designer` (defaults to TruthPitch) + `Product.status` (`pending` → `approved`)    |
| Persist orders               | `saveOrder()` in `lib/orders.ts` receives the full typed `Order`                             |
| Stripe                       | Implement `PaymentProvider` in `lib/commerce/providers.ts` (example included in comments); mount the Payment Element in the checkout Payment step |
| Printful                     | Implement `FulfillmentProvider`; map `variantId` → Printful `sync_variant_id` (`ProductVariant.fulfillmentVariantId`) |
| Accounts                     | Set `NEXT_PUBLIC_ENABLE_AUTH=true` to show the navbar “Sign in” link (`/sign-in` placeholder); `Order.userId` is ready |

## Replacing placeholder content

- **Product photos:** edit `images` in `data/products.ts`. Use 4:5 photos, at least 1200×1500.
- **Hero, About and community photos:** `components/home/*`, `app/about/page.tsx` and `components/about/StoryChapters.tsx`.
- **Copy, socials and email:** `lib/site.ts`.
