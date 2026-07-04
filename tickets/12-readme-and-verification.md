# Ticket 12 — README + verification checklist

## Goal
Write the README so a fresh reader can (a) run the harness locally against
any of the three providers and (b) walk the end-to-end journey per provider
to verify affy.pro's integration guide.

## In scope
- `README.md` covering, in order:
  1. What this app is (one paragraph — point at `ARCHITECTURE.md` for depth).
  2. Prerequisites (Node, ngrok for Chargebee/Paddle).
  3. Setup:
     - `npm install`
     - Copy `.env.example` → `.env.local`, fill in the block for the
       provider you're testing.
     - `npm run dev`.
  4. **Per-provider walkthrough**, one section each:
     - **Stripe**
       - Which env vars to set.
       - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
       - `stripe trigger <event>` for each of the four events.
       - Expected: entries in `.data/webhook-log-stripe.json`.
     - **Chargebee**
       - Test-site setup on Chargebee's side.
       - Start ngrok, note the URL.
       - Configure webhook in Chargebee dashboard as
         `https://<user>:<pass>@<ngrok>/api/webhooks/chargebee`.
       - Drive a test checkout; expected log entries.
     - **Paddle**
       - Sandbox setup.
       - Start ngrok, note the URL.
       - Add destination in Paddle sandbox → Notifications pointing at
         `https://<ngrok>/api/webhooks/paddle`; copy secret to
         `PADDLE_WEBHOOK_SECRET`.
       - Drive a sandbox transaction; expected log entries.
  5. **affy.pro snippet placement** — the two exact locations to paste:
     - Capture: `app/layout.tsx`, inside the delimited banner.
     - Conversion: `app/thank-you/page.tsx`, inside the delimited banner.
  6. **Switching providers** — set `BILLING_PROVIDER`, restart dev server,
     re-run the walkthrough for that provider.
  7. **Manual verification checklist** — a copy-pasteable checklist per
     provider:
     - [ ] Land on `/?ref=test123` — DebugPanel shows captured ID.
     - [ ] Click Sign Up — arrive at correct provider's checkout.
     - [ ] Complete test payment — land on `/thank-you`.
     - [ ] Console shows `[affy] conversion fired ...`.
     - [ ] `.data/webhook-log-<provider>.json` contains expected events.
     - [ ] `/dashboard` shows active provider + recent events.
  8. **Known limitations** — Vercel filesystem is read-only outside `/tmp`;
     harness is intended for local dev. Reference `ARCHITECTURE.md §5`.

## Out of scope
- Any code changes. This is documentation.
- Screenshots (nice to have; skip unless the user asks).

## Files touched
- `README.md` (overwrite the stub from Ticket 01)

## Steps
1. Draft the README following the outline above.
2. Walk the actual Stripe checklist end-to-end and update the doc where it
   drifts from reality.
3. Repeat for Chargebee and Paddle if you have working credentials; if not,
   leave the checklist and TODO markers for the user to run.
4. Commit: `docs: readme and verification checklist`.

## Acceptance criteria
- README covers setup, per-provider walkthrough, and the affy.pro snippet
  placement locations.
- Manual checklist is copy-pasteable.
- Following the Stripe section end-to-end from a fresh clone actually works.

## Dependencies
- Tickets 01–11 (documents them).
