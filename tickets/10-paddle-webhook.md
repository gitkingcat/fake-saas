# Ticket 10 — Paddle webhook

## Goal
Implement `/api/webhooks/paddle` with Paddle Billing's HMAC signature
verification, and log every accepted event to `.data/webhook-log-paddle.json`
plus console.

## In scope
- `app/api/webhooks/paddle/route.ts`
  - `export const runtime = 'nodejs'`.
  - Reads raw body with `await request.text()`.
  - Parses the `Paddle-Signature` header — Paddle Billing format is
    `ts=<timestamp>;h1=<hex hmac>`.
  - Computes `HMAC_SHA256(secret, ts + ':' + rawBody)`, hex-encodes, and
    compares to `h1` using `crypto.timingSafeEqual`.
  - Uses `PADDLE_WEBHOOK_SECRET` from env.
  - **Explicit comment** in the file: this is Paddle Billing (current API),
    not Paddle Classic. Classic uses a different scheme (public key + form
    body). Don't accidentally implement Classic.
  - Handles events:
    - `transaction.completed`
    - `subscription.created`
    - `subscription.updated`
    - `subscription.canceled`
  - Handler logs full parsed event to console + appends via
    `webhookLog.append('paddle', event)`.
  - Returns 200 on success, 400 on missing / malformed header, 401 on HMAC
    mismatch.

## Out of scope
- Paddle Classic support.
- Retries / replays.
- Stripe / Chargebee webhooks.

## Files touched
- `app/api/webhooks/paddle/route.ts` (new)

## Steps
1. Implement the route with the HMAC verification.
2. Local test via ngrok:
   - `ngrok http 3000`.
   - In Paddle sandbox → Developer Tools → Notifications, add a destination
     pointing at `https://<ngrok-host>/api/webhooks/paddle`.
   - Copy the secret Paddle generates into `PADDLE_WEBHOOK_SECRET`.
   - Drive a sandbox transaction, or use Paddle's "Send test event" from the
     destination settings.
3. Confirm each event lands in `.data/webhook-log-paddle.json` and console.
4. Confirm a bad-HMAC request → 401, no log entry.
5. Commit: `feat: paddle billing webhook with hmac verify`.

## Acceptance criteria
- Real Paddle sandbox event → 200 + log entry.
- Tampered body with valid header → 401.
- File explicitly notes Paddle Billing vs Classic.

## Dependencies
- Ticket 02.
