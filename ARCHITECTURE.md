# Fake SaaS Test Harness — Architecture & Plan

A lightweight Next.js (App Router, TypeScript) app that mimics a real SaaS
client integrating **affy.pro** with one of three billing providers
(**Stripe**, **Chargebee**, **Paddle**). Purpose: walk the full client journey
— affiliate link → landing → signup → checkout → conversion tracking →
webhook — against each provider independently, using the same base app.

---

## 1. Guiding principles

- **One app, three providers, one active at a time.** A `BILLING_PROVIDER`
  env var selects which checkout renders on `/signup`. All three webhook
  endpoints exist simultaneously (they are just URLs at different paths) —
  the "active" one is simply the one currently being pointed at from the
  provider dashboard.
- **Copy-paste realism.** Every provider integration mirrors what a real
  client would paste from the provider's docs. No abstraction that a client
  wouldn't have. Provider blocks are clearly commented so switching
  providers is obvious.
- **Nothing to install beyond Node + npm.** No DB, no ORM, no auth. JSON
  files under `.data/` for webhook logs; cookies + localStorage for the
  affiliate ref (which is what affy.pro's snippet manages anyway).
- **Deployable to Vercel, but designed for local + ngrok.** Webhook testing
  needs a public URL. Vercel's filesystem is read-only outside `/tmp`, so
  JSON log persistence only works reliably locally. This is documented, not
  worked around — the harness is a dev tool.
- **Signature verification is real, not stubbed.** Each webhook uses the
  provider's real verification method. Verifying that affy.pro parses real
  payloads is the whole point.

---

## 2. High-level structure

```
app/
  layout.tsx                     # Root layout + affy.pro tracking snippet placeholder
  page.tsx                       # Landing (hero + pricing + Sign Up CTA)
  signup/page.tsx                # Renders active provider's checkout
  thank-you/page.tsx             # Provider-agnostic; fires affy.pro conversion
  dashboard/page.tsx             # Dev-only debug (active provider, recent webhooks, aff cookie, simulate button)
  api/
    checkout/
      stripe/route.ts            # Creates a Stripe Checkout Session, returns { url }
    webhooks/
      stripe/route.ts            # Stripe signature verification
      chargebee/route.ts         # Chargebee Basic Auth verification
      paddle/route.ts            # Paddle Billing HMAC verification
    reset/route.ts               # POST: clear all logs + state
    simulate-conversion/route.ts # Manual conversion trigger (from DebugPanel)
components/
  checkout/StripeCheckout.tsx
  checkout/ChargebeeCheckout.tsx
  checkout/PaddleCheckout.tsx
  DebugPanel.tsx                 # Shows captured affiliate ID, manual fire button
lib/
  billing/provider.ts            # Resolves + validates active BILLING_PROVIDER
  log/webhook-log.ts             # Append + read per-provider JSON log files
.data/                            # gitignored; webhook logs land here
  webhook-log-stripe.json
  webhook-log-chargebee.json
  webhook-log-paddle.json
.env.example
README.md
```

---

## 3. Key design decisions

### 3.1 Provider switching

`BILLING_PROVIDER` ∈ `stripe | chargebee | paddle`. Read once in
`lib/billing/provider.ts` which:

- Returns the active provider identifier.
- Fails fast at boot if the value is invalid or required env vars for that
  provider are missing.
- Is imported by `/signup` (to decide which checkout component to render)
  and `/dashboard` (to filter the log view).

Webhook handlers do **not** consult `BILLING_PROVIDER` — each responds
only to its own provider's shape at its own URL. This matches how a real
client would leave old webhook endpoints in place while switching.

### 3.2 Affiliate tracking

Two integration points, both **placeholder-only** (affy.pro's actual snippet
is pasted by the user):

1. **Capture** — in `app/layout.tsx`, a clearly delimited `<Script>` block
   where affy.pro's snippet reads `?ref=` / `?aff=` and writes a cookie +
   localStorage. Loaded with `strategy="afterInteractive"`.
2. **Conversion fire** — on `/thank-you`, a second placeholder block where
   the conversion call goes. A `console.log('[affy] conversion fired', …)`
   sits next to it so DevTools shows the fire.

Both blocks are **identical across providers** — that identity is what the
harness exists to prove.

### 3.3 Webhook verification (the tricky part)

Each provider verifies differently and needs the raw request body, not the
parsed JSON. All three route handlers:

- Declare `export const runtime = 'nodejs'` (raw body isn't available on
  edge).
- Read `await request.text()` **before** parsing JSON.
- Verify, then parse, then log.

Provider-specific:

| Provider  | Method                    | How                                                                                   |
|-----------|---------------------------|---------------------------------------------------------------------------------------|
| Stripe    | `Stripe-Signature` header | `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`                 |
| Chargebee | HTTP Basic Auth           | Client configures `https://user:pass@host/webhook`; server checks `Authorization`     |
| Paddle    | `Paddle-Signature` header | HMAC-SHA256 of `${ts}:${rawBody}` with `PADDLE_WEBHOOK_SECRET`; constant-time compare |

Paddle Billing (current API) is used, **not** Paddle Classic — schemes
differ and the current one is what affy.pro's guide will target.

### 3.4 Log persistence

`lib/log/webhook-log.ts` exposes `append(provider, event)` and
`read(provider, limit?)`. Each provider has its own JSON file under
`.data/`. Files are created on first write. `/api/reset` truncates all
three. This is intentionally dumb — the goal is to *see* the payloads, not
to query them.

### 3.5 Dev-only dashboard

`/dashboard` is not gated behind auth (this is a test harness), but the
page renders a big "DEV ONLY" banner and is excluded from any nav. Shows:

- Active `BILLING_PROVIDER` + a warning if required env vars are missing.
- Last N events from that provider's log (with a link to view all).
- Current affiliate cookie / localStorage value (client-rendered).
- "Simulate conversion" button — POSTs to `/api/simulate-conversion` which
  logs a synthetic event so you can exercise the affy.pro conversion path
  without running a real checkout.

### 3.6 Styling

Tailwind (Next.js default). Keeps the app visually credible as a "SaaS
landing" without adding a component library.

---

## 4. Env vars

Grouped in `.env.example`:

```
# Which provider is active. One of: stripe | chargebee | paddle
BILLING_PROVIDER=stripe

# affy.pro
AFFY_TRACKING_ID=

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# Chargebee (test site)
NEXT_PUBLIC_CHARGEBEE_SITE=
NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY=
CHARGEBEE_PLAN_ID=
CHARGEBEE_WEBHOOK_USER=
CHARGEBEE_WEBHOOK_PASSWORD=

# Paddle (sandbox, Paddle Billing)
NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN=
PADDLE_PRICE_ID=
PADDLE_WEBHOOK_SECRET=
```

Only the block matching the active `BILLING_PROVIDER` is required at boot;
the others may be blank. Publishable / client-token values use the
`NEXT_PUBLIC_` prefix because Next.js only exposes those to the browser,
and the checkout components need them client-side.

---

## 5. Known constraints & non-goals

- **No database.** State lives in JSON files + browser storage. Restarting
  the dev server does not clear webhook logs (they're on disk); `/api/reset`
  does.
- **Vercel prod deployment is best-effort.** Webhook logs won't persist
  across cold starts on Vercel. Local + ngrok is the intended workflow.
- **No user accounts / sessions.** The "signup" is just a checkout — the
  thank-you page is reached by the provider's success redirect.
- **No end-to-end tests.** The harness *is* the test. Manual walkthrough
  per provider is the verification loop.

---

## 6. Implementation plan (ordered, small steps)

Each step is small enough to review and land independently. Steps 3–5 can
be done per-provider in isolation if you'd rather validate one provider
end-to-end before wiring the others.

### Step 0 — Repo scaffold
- `npx create-next-app` (App Router, TS, Tailwind, ESLint, no `src/`).
- Add `.gitignore` entries for `.data/` and `.env*.local`.
- Commit baseline.

### Step 1 — Shared foundation
- `lib/billing/provider.ts` — env resolver + validator.
- `lib/log/webhook-log.ts` — append/read for `.data/webhook-log-<p>.json`.
- Root `app/layout.tsx` with:
  - Tailwind base.
  - **Placeholder block** for affy.pro capture snippet (commented, clearly
    delimited).
- `.env.example` populated per §4.

### Step 2 — Landing page + debug panel
- `app/page.tsx` — hero + 3-tier pricing card + "Sign Up" CTA linking to
  `/signup` and preserving any `?ref=` / `?aff=` in the URL.
- `components/DebugPanel.tsx` — reads affiliate cookie / localStorage,
  shows captured ID. Included on landing + dashboard.

### Step 3 — `/signup` shell + Stripe checkout
- `app/signup/page.tsx` — server component reads active provider, renders
  the matching client component.
- `components/checkout/StripeCheckout.tsx` — loads Stripe.js, redirects to
  Stripe Checkout with `STRIPE_PRICE_ID`. Success URL → `/thank-you`.
- All three provider blocks stubbed with `TODO`-style comments so the
  active one is obvious.

### Step 4 — Chargebee checkout
- `components/checkout/ChargebeeCheckout.tsx` — loads Chargebee.js from
  `${CHARGEBEE_SITE}`, opens hosted-page checkout for `CHARGEBEE_PLAN_ID`.
  Success → `/thank-you`.

### Step 5 — Paddle checkout
- `components/checkout/PaddleCheckout.tsx` — loads Paddle.js sandbox with
  `PADDLE_SANDBOX_CLIENT_TOKEN`, opens overlay for `PADDLE_PRICE_ID`.
  Success → `/thank-you`.

### Step 6 — `/thank-you` + conversion placeholder
- `app/thank-you/page.tsx` — provider-agnostic confirmation.
- Placeholder `<Script>` block for affy.pro conversion snippet.
- `console.log('[affy] conversion fired', { affiliateId, orderId })` next
  to it.

### Step 7 — Webhook: Stripe
- `app/api/webhooks/stripe/route.ts` — raw body, signature verify, log
  full payload to console + `.data/webhook-log-stripe.json`.
- Events: `checkout.session.completed`, `customer.subscription.created`,
  `invoice.paid`, `customer.subscription.deleted`.

### Step 8 — Webhook: Chargebee
- `app/api/webhooks/chargebee/route.ts` — Basic Auth verify, log to
  console + `.data/webhook-log-chargebee.json`.
- Events: `subscription_created`, `subscription_activated`,
  `payment_succeeded`, `subscription_cancelled`.

### Step 9 — Webhook: Paddle
- `app/api/webhooks/paddle/route.ts` — Paddle Billing HMAC verify, log to
  console + `.data/webhook-log-paddle.json`.
- Events: `transaction.completed`, `subscription.created`,
  `subscription.updated`, `subscription.canceled`.

### Step 10 — Dashboard + reset + simulate
- `/api/reset` — truncates all three log files.
- `/api/simulate-conversion` — appends a synthetic event to the active
  provider's log; used by the dashboard button.
- `app/dashboard/page.tsx` — active provider, missing-env warnings, last
  N events, affiliate ID display, simulate button.

### Step 11 — README
- Per-provider setup (Stripe CLI, Chargebee + ngrok, Paddle sandbox +
  ngrok).
- Where to paste the affy.pro capture snippet + conversion snippet.
- How to switch `BILLING_PROVIDER` and re-run the flow.

### Step 12 — Manual verification pass
- For each provider: run through landing → signup → checkout → thank-you
  → confirm webhook logged. Fix rough edges. Not code — a sanity checklist
  in the README.

---

## 7. Open questions for the user

1. **Tailwind or plain CSS?** Recommending Tailwind (default in
   `create-next-app`), but plain CSS keeps deps smaller. Preference?
2. **Chargebee checkout style — hosted page (redirect) or in-app drop-in?**
   Recommending hosted page since it's what most affy.pro clients would
   pick, but happy to do drop-in.
3. **Any actual affy.pro snippet available yet, or purely placeholder?**
   If you have the real snippet, Step 1 and Step 6 can drop it in
   directly instead of a `TODO`.
4. **Node package manager preference?** `npm` (default), `pnpm`, or `bun`?
