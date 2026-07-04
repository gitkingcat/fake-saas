# Ticket 05 — Chargebee checkout component

## Goal
Replace the stub from Ticket 04 with a working Chargebee **hosted-page**
checkout that a real client would recognize from Chargebee's docs.

## In scope
- `components/checkout/ChargebeeCheckout.tsx`
  - Client component.
  - Loads Chargebee.js from `https://js.chargebee.com/v2/chargebee.js`.
  - Initializes with `site: process.env.NEXT_PUBLIC_CHARGEBEE_SITE` and
    `publishableKey: process.env.NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY`.
  - CTA opens the hosted-page checkout for `CHARGEBEE_PLAN_ID`. Success →
    redirect to `/thank-you`.
  - Uses Chargebee's own `openCheckout({ hostedPage, success, ... })` shape —
    do not abstract, mirror their docs.
- Optionally a small `/api/checkout/chargebee` route that returns a hosted
  page object created via Chargebee's server SDK (if hosted-page style
  requires server-side creation). Only add if actually needed by Chargebee's
  hosted-page flow; if the client-only Drop-In works with just publishable
  key + plan ID, skip.

## Out of scope
- Chargebee webhook — Ticket 09.
- Stripe / Paddle checkouts.
- Dashboard.

## Files touched
- `components/checkout/ChargebeeCheckout.tsx` (replace stub)
- Possibly `app/api/checkout/chargebee/route.ts` (only if needed)
- `package.json` (add `chargebee` if the server SDK is used)

## Steps
1. Verify from Chargebee's current docs whether hosted-page checkout can be
   opened purely client-side with a plan ID, or whether it needs a
   `hostedPage` object created server-side. Implement whichever their docs
   show as the canonical path for a "SaaS integrating Chargebee" client.
2. Implement the component. Keep it a near-direct copy of Chargebee's
   snippet, with a comment noting where it came from.
3. With `BILLING_PROVIDER=chargebee` and valid test-site env vars, verify
   the checkout opens against the Chargebee test site.
4. Confirm success URL → `/thank-you`.
5. Commit: `feat: chargebee checkout`.

## Acceptance criteria
- `/signup` with `BILLING_PROVIDER=chargebee` opens Chargebee's hosted
  checkout against the configured test site.
- Successful test-site payment redirects to `/thank-you`.
- The other two providers' stubs / real components are untouched.

## Dependencies
- Ticket 04 (signup shell exists).
