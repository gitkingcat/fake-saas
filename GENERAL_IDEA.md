Build a minimal "fake SaaS" test harness app that I'll use to test affy.pro's
affiliate integration guides end-to-end, exactly as a real client would set
them up. affy.pro supports THREE billing providers — Stripe, Chargebee, and
Paddle — and I need to test all three integration guides independently using
the same base app.

STACK: Next.js (App Router), TypeScript, deployed-ready for Vercel. Keep it
lightweight — no database, use in-memory or simple JSON files for state.

ARCHITECTURE:
Build this as a single app with a provider switcher, not three separate apps.
A config value (env var BILLING_PROVIDER=stripe|chargebee|paddle) determines
which checkout flow and webhook handler is active at any time, so I can test
one provider at a time but reuse the same landing/tracking setup.

PAGES NEEDED:
1. `/` - Landing page for a fake SaaS product ("TestFlow" or similar
   placeholder). Simple hero + pricing section with "Sign Up" CTA. Should
   capture affiliate ref params (?ref= or ?aff=) regardless of billing provider.

2. `/signup` - Signup page that renders the correct checkout for whichever
   BILLING_PROVIDER is active:
    - Stripe: embed Stripe Checkout (test mode), placeholders for
      STRIPE_PUBLISHABLE_KEY and STRIPE_PRICE_ID
    - Chargebee: embed Chargebee's hosted checkout page or in-app checkout
      (test site), placeholders for CHARGEBEE_SITE, CHARGEBEE_PUBLISHABLE_KEY,
      and CHARGEBEE_PLAN_ID
    - Paddle: embed Paddle's Checkout overlay (sandbox mode), placeholders for
      PADDLE_SANDBOX_CLIENT_TOKEN and PADDLE_PRICE_ID
      Clearly comment which block belongs to which provider so unused ones can
      be easily toggled off.

3. `/thank-you` - Post-checkout confirmation page, provider-agnostic. This is
   where the affy.pro conversion tracking snippet fires regardless of which
   billing provider was used. Leave a clearly commented placeholder block for
   affy.pro's exact conversion tracking script, and log to console when it
   fires so I can verify in DevTools.

4. Webhook endpoints, one per provider, each verifying signatures using that
   provider's actual method (they all differ):
    - `/api/webhooks/stripe` - verify using Stripe signing secret
      (STRIPE_WEBHOOK_SECRET), listen for checkout.session.completed,
      customer.subscription.created, invoice.paid, customer.subscription.deleted
    - `/api/webhooks/chargebee` - verify using Chargebee's webhook auth
      (basic auth or IP allowlist per their docs — implement whichever
      Chargebee actually supports), listen for subscription_created,
      subscription_activated, payment_succeeded, subscription_cancelled
    - `/api/webhooks/paddle` - verify using Paddle's signature verification
      (HMAC via PADDLE_WEBHOOK_SECRET, note Paddle Classic vs Paddle Billing
      have different schemes — use Paddle Billing/current API), listen for
      transaction.completed, subscription.created, subscription.updated,
      subscription.canceled

   Each endpoint should log the full parsed event payload to console AND
   append it to a provider-specific JSON file (webhook-log-stripe.json,
   webhook-log-chargebee.json, webhook-log-paddle.json) so I can inspect
   exactly what each provider sent and confirm affy.pro parses each one
   correctly — field names and payload shapes differ significantly between
   the three.

5. `/api/reset` - POST endpoint that clears all three webhook log files and
   any local test state.

6. `/dashboard` (dev-only debug page) - Shows: which BILLING_PROVIDER is
   currently active, the last N webhook events received for that provider,
   current affiliate tracking cookie/localStorage value, and a manual
   "simulate conversion" button.

TRACKING SCRIPT INTEGRATION:
- In the root layout, add a clearly commented placeholder block where I'll
  paste affy.pro's tracking snippet (captures ?ref=/?aff= params, sets
  cookie/localStorage). This should be identical regardless of billing
  provider — the whole point is confirming tracking works the same across
  all three.
- Debug panel showing captured affiliate ID and a manual conversion trigger.

ENV SETUP:
- `.env.example` with all placeholders grouped by provider, plus
  BILLING_PROVIDER switch and AFFY_TRACKING_ID.
- README covering, per provider:
    - Stripe: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`,
      `stripe trigger <event>`
    - Chargebee: how to set up a test site, configure webhook URL in Chargebee
      dashboard (note: may need ngrok since Chargebee test sites need a public
      URL, no local CLI equivalent to Stripe's)
    - Paddle: how to set up Paddle Sandbox, configure webhook destination in
      Paddle dashboard (also needs ngrok for local testing), and how to trigger
      test transactions in sandbox
    - Where exactly to paste affy.pro's tracking snippet and conversion call
    - How to switch BILLING_PROVIDER and re-run the full flow for each one

GOAL: This app should let me walk through the full client journey — landing
page with affiliate link → signup → payment (via whichever provider is
active) → conversion fired → webhook received and parsed — so I can verify
each of affy.pro's three billing integration guides (Stripe, Chargebee,
Paddle) actually works as documented, using only what a real client would
see and copy-paste for that specific provider.

Please scaffold the full project structure and code now, with all three
provider integrations stubbed and ready, gated behind the BILLING_PROVIDER
switch.