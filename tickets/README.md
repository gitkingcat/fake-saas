# Implementation tickets

Session-sized tickets derived from `ARCHITECTURE.md` §6. Each ticket is scoped
so a single AI session can land it start-to-finish: read the ticket, implement,
verify against the acceptance criteria, commit.

## Order & dependencies

```
01 ──▶ 02 ──▶ 03 ──▶ 04 ──▶ 07 ──▶ 08 ──▶ 11 ──▶ 12
                     │
                     ├──▶ 05  (Chargebee checkout, independent of 04 once shell exists)
                     └──▶ 06  (Paddle checkout, independent of 04 once shell exists)

08 / 09 / 10 (webhooks) can be done in any order once 02 is in.
```

The critical path to a working Stripe end-to-end demo is **01 → 02 → 03 → 04 → 07 → 08 → 11**.
Chargebee and Paddle (05, 06, 09, 10) can slot in later once the Stripe path proves the shape.

## Tickets

| # | Title | Notes |
|---|---|---|
| [01](01-scaffold.md) | Repo scaffold | `create-next-app`, `.gitignore`, baseline commit |
| [02](02-shared-foundation.md) | Shared foundation | provider resolver, webhook log lib, root layout w/ tracking placeholder, `.env.example` |
| [03](03-landing-and-debug-panel.md) | Landing page + DebugPanel | hero, pricing, Sign Up CTA that preserves `?ref=`/`?aff=` |
| [04](04-signup-shell-and-stripe-checkout.md) | `/signup` shell + Stripe checkout | server-side provider dispatch, Stripe.js client component |
| [05](05-chargebee-checkout.md) | Chargebee checkout component | hosted-page checkout via Chargebee.js |
| [06](06-paddle-checkout.md) | Paddle checkout component | Paddle Billing sandbox overlay |
| [07](07-thank-you-and-conversion.md) | `/thank-you` + conversion placeholder | provider-agnostic, affy.pro conversion snippet placeholder |
| [08](08-stripe-webhook.md) | Stripe webhook | raw body + signature verify, log to disk |
| [09](09-chargebee-webhook.md) | Chargebee webhook | Basic Auth verify, log to disk |
| [10](10-paddle-webhook.md) | Paddle webhook | Paddle Billing HMAC verify, log to disk |
| [11](11-dashboard-reset-simulate.md) | Dashboard + reset + simulate | `/dashboard`, `/api/reset`, `/api/simulate-conversion` |
| [12](12-readme-and-verification.md) | README + verification checklist | per-provider setup, ngrok notes, manual walkthrough |

## Conventions

- Each ticket file has: **Goal**, **In scope**, **Out of scope**, **Files
  touched**, **Steps**, **Acceptance criteria**, **Dependencies**.
- "Out of scope" is load-bearing — resist the urge to bundle adjacent work.
- Placeholder blocks for affy.pro's snippet stay as commented `TODO` blocks
  until the real snippet is available; do not invent one.
- Every provider block is clearly delimited with a comment banner so a
  reader can tell which lines belong to which provider.
