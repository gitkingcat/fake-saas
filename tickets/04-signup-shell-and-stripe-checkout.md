# Ticket 04 — `/signup` shell + Stripe checkout

## Goal
Build the `/signup` page as a server component that dispatches to the active
provider's checkout component, and implement the first of those three
components: Stripe.

## In scope
- `app/signup/page.tsx`
  - Server component.
  - Calls `getActiveProvider()` from `lib/billing/provider.ts`.
  - Renders exactly **one** of `<StripeCheckout />`, `<ChargebeeCheckout />`,
    `<PaddleCheckout />` based on the active provider.
  - Renders a clear on-page banner: "Active provider: X" (helpful when
    switching for tests).
  - If the active provider's required env vars are missing, render a
    remediation message instead of crashing.
- `components/checkout/StripeCheckout.tsx`
  - Client component.
  - Loads `@stripe/stripe-js` with `STRIPE_PUBLISHABLE_KEY` (exposed via
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
  - On CTA click, calls a small server action or route
    (`/api/checkout/stripe`) that creates a Checkout Session server-side
    using `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`, then redirects to the
    hosted Checkout URL. Success URL → `/thank-you`, cancel URL → `/signup`.
  - Copy-paste-realistic: mirror what Stripe's own quickstart shows.
- `components/checkout/ChargebeeCheckout.tsx` and
  `components/checkout/PaddleCheckout.tsx`
  - **Stubs** with a big `TODO(ticket-05)` / `TODO(ticket-06)` comment
    banner. Render a placeholder message so the app doesn't crash if the
    user flips `BILLING_PROVIDER` before Tickets 05/06 land.

## Out of scope
- Chargebee + Paddle real checkouts — Tickets 05, 06.
- `/thank-you` page — Ticket 07 (Stripe's success URL will 404 until then;
  that's fine).
- Webhook handling — Ticket 08.

## Steps
1. Add `stripe` (server) + `@stripe/stripe-js` (client) dependencies.
2. Implement `app/signup/page.tsx` — dispatcher + missing-env fallback.
3. Implement `components/checkout/StripeCheckout.tsx` — client button that
   POSTs to `/api/checkout/stripe`.
4. Implement `app/api/checkout/stripe/route.ts` — creates a Checkout Session,
   returns `{ url }`, client `window.location = url`s.
5. Stub `ChargebeeCheckout.tsx` and `PaddleCheckout.tsx` with `TODO` banners.
6. With `BILLING_PROVIDER=stripe` and valid test-mode Stripe env vars, click
   through to Stripe's hosted checkout. (You can smoke-test with Stripe's
   test cards.)
7. Commit: `feat: signup dispatch + stripe checkout`.

## Acceptance criteria
- `/signup` with `BILLING_PROVIDER=stripe` renders the Stripe CTA.
- Clicking the CTA redirects to a real Stripe Checkout URL.
- `/signup` with `BILLING_PROVIDER=chargebee|paddle` renders the stub without
  crashing.
- Missing env vars produce a readable message, not a stack trace.

## Dependencies
- Ticket 02.
