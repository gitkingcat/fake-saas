# Ticket 09 — Chargebee webhook

## Goal
Implement `/api/webhooks/chargebee` with Chargebee's actual auth mechanism
(HTTP Basic Auth), and log every accepted event to
`.data/webhook-log-chargebee.json` plus console.

## In scope
- `app/api/webhooks/chargebee/route.ts`
  - `export const runtime = 'nodejs'`.
  - Verifies via `Authorization: Basic ...` — decode, compare against
    `CHARGEBEE_WEBHOOK_USER` / `CHARGEBEE_WEBHOOK_PASSWORD`, constant-time
    compare using `crypto.timingSafeEqual` after length-check padding.
  - Chargebee client config: the user configures the webhook URL in their
    Chargebee dashboard as
    `https://<user>:<password>@<host>/api/webhooks/chargebee`.
    Document this in the route file as a leading comment, and in the README
    (Ticket 12).
  - Handles events:
    - `subscription_created`
    - `subscription_activated`
    - `payment_succeeded`
    - `subscription_cancelled`
  - Handler logs full parsed event to console + appends via
    `webhookLog.append('chargebee', event)`.
  - Returns 200 on success, 401 on missing/invalid auth.

## Out of scope
- IP allowlist alternative (Chargebee supports it but Basic Auth is easier
  for a harness).
- Stripe / Paddle webhooks.
- Dashboard.

## Files touched
- `app/api/webhooks/chargebee/route.ts` (new)

## Steps
1. Implement the route.
2. Local test via ngrok:
   - Start `ngrok http 3000`.
   - Point Chargebee's test-site webhook config at
     `https://<user>:<password>@<ngrok-host>/api/webhooks/chargebee`.
   - Trigger events from the Chargebee dashboard or by driving a test
     checkout.
3. Confirm each event lands in `.data/webhook-log-chargebee.json` and prints
   to console.
4. Confirm a request without credentials returns 401.
5. Commit: `feat: chargebee webhook with basic auth`.

## Acceptance criteria
- Chargebee-dispatched event with correct Basic Auth → 200 + log entry.
- Missing / wrong Basic Auth → 401, no log entry.
- Timing-safe comparison is actually used (not `===`).

## Dependencies
- Ticket 02.
