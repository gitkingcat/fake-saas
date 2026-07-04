# Ticket 08 — Stripe webhook

## Goal
Implement `/api/webhooks/stripe` with real signature verification, and log
every accepted event to `.data/webhook-log-stripe.json` plus console.

## In scope
- `app/api/webhooks/stripe/route.ts`
  - `export const runtime = 'nodejs'`.
  - `export const dynamic = 'force-dynamic'` (defensive against caching).
  - Reads `await request.text()` for the raw body **before** parsing.
  - Verifies via `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
  - Handles events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `invoice.paid`
    - `customer.subscription.deleted`
  - Handler just logs the full parsed event to console and appends via
    `webhookLog.append('stripe', event)`. No business logic; the harness
    exists to *observe* payloads, not act on them.
  - Returns 200 on success, 400 on signature mismatch, 400 on missing
    signature header. All error responses log a clear message so `stripe
    listen` output is diagnosable.

## Out of scope
- Chargebee / Paddle webhooks.
- Any UI to view logs (dashboard is Ticket 11).
- Deduping / idempotency — harness only.

## Files touched
- `app/api/webhooks/stripe/route.ts` (new)

## Steps
1. Confirm `stripe` server SDK is installed (added in Ticket 04).
2. Implement the route.
3. Local test:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   stripe trigger invoice.paid
   stripe trigger customer.subscription.deleted
   ```
4. Confirm each event lands in `.data/webhook-log-stripe.json` and prints to
   console.
5. Confirm an intentionally bad signature (e.g. `curl` with a garbage
   `Stripe-Signature`) returns 400 and is logged.
6. Commit: `feat: stripe webhook with signature verify`.

## Acceptance criteria
- `stripe trigger <event>` results in a 200 and a new entry in the log file.
- Bad signature → 400, no log entry appended.
- Full raw parsed event (not a summary) is what gets persisted.

## Dependencies
- Ticket 02 (webhook log lib).
- Ticket 04 or its Stripe SDK install.
