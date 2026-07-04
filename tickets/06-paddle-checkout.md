# Ticket 06 — Paddle checkout component

## Goal
Replace the stub from Ticket 04 with a working Paddle Billing (sandbox)
overlay checkout that mirrors Paddle's canonical docs snippet.

## In scope
- `components/checkout/PaddleCheckout.tsx`
  - Client component.
  - Loads Paddle.js: `https://cdn.paddle.com/paddle/v2/paddle.js`.
  - `Paddle.Environment.set('sandbox')`.
  - `Paddle.Initialize({ token: NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN })`.
  - CTA opens the overlay via `Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }], successUrl: '/thank-you' })`.
  - Uses Paddle Billing (v2) — **not** Paddle Classic. Comment this explicitly
    in the file since the two SDKs coexist in the wild and it matters.

## Out of scope
- Paddle webhook — Ticket 10.
- Stripe / Chargebee checkouts.
- Any Paddle server SDK — the overlay is client-driven; no need to talk to
  Paddle's API server-side for the happy path.

## Files touched
- `components/checkout/PaddleCheckout.tsx` (replace stub)

## Steps
1. Look up Paddle Billing's current initialization snippet from their docs.
   Mirror it, comment the source.
2. Ensure the `NEXT_PUBLIC_` prefix is applied to the client token so it's
   exposed to the browser.
3. Verify sandbox mode is enforced (Paddle silently ships live if you
   forget).
4. With `BILLING_PROVIDER=paddle` and valid sandbox env vars, verify the
   overlay opens and completes against Paddle sandbox.
5. Confirm success redirect → `/thank-you`.
6. Commit: `feat: paddle billing checkout`.

## Acceptance criteria
- `/signup` with `BILLING_PROVIDER=paddle` opens Paddle's sandbox overlay.
- Successful sandbox payment redirects to `/thank-you`.
- File explicitly comments that this uses Paddle Billing, not Classic.

## Dependencies
- Ticket 04 (signup shell exists).
