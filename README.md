# Fake SaaS Test Harness

A lightweight Next.js app that mimics a real SaaS client integrating
[affy.pro](https://affy.pro) with one of three billing providers — **Stripe**,
**Chargebee**, or **Paddle**. It walks the complete client journey: affiliate
link → landing page → signup → checkout → conversion tracking → webhook logging.
One provider is active at a time, selected by an env var.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design rationale and the full
implementation plan.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Stripe CLI** (for Stripe webhook testing) — [install docs](https://docs.stripe.com/stripe-cli)
- **ngrok** (for Chargebee and Paddle webhook testing) — [install docs](https://ngrok.com/download)

---

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in the block for the provider you're testing (see below).
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Per-provider walkthroughs

### Stripe

**Env vars to set in `.env.local`:**

```
BILLING_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...   # filled in after step 2
```

**Step 1 — Start the dev server and forward webhooks:**

In a second terminal, start the Stripe CLI listener:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret it prints and set it as `STRIPE_WEBHOOK_SECRET`
in `.env.local`, then restart `npm run dev`.

**Step 2 — Trigger test events:**

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

**Expected result:** Each event appears in `.data/webhook-log-stripe.json` and
is printed to the dev-server console as `[stripe-webhook] Received <event>`.

---

### Chargebee

**Env vars to set in `.env.local`:**

```
BILLING_PROVIDER=chargebee
NEXT_PUBLIC_CHARGEBEE_SITE=your-test-site
NEXT_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY=test_...
CHARGEBEE_API_KEY=test_...
CHARGEBEE_PLAN_ID=your-plan-id
CHARGEBEE_WEBHOOK_USER=any-username-you-choose
CHARGEBEE_WEBHOOK_PASSWORD=any-strong-password-you-choose
```

> `CHARGEBEE_WEBHOOK_USER` and `CHARGEBEE_WEBHOOK_PASSWORD` are values you
> invent — they are not issued by Chargebee. You use them in the webhook URL
> so Chargebee can authenticate to your endpoint.

**Step 1 — Start ngrok:**

```bash
ngrok http 3000
```

Note the `https://<id>.ngrok-free.app` URL.

**Step 2 — Configure the webhook in the Chargebee dashboard:**

Go to **Settings → API & Webhooks → Webhook Settings** and add a new webhook URL:

```
https://<CHARGEBEE_WEBHOOK_USER>:<CHARGEBEE_WEBHOOK_PASSWORD>@<id>.ngrok-free.app/api/webhooks/chargebee
```

Set the API version to v2 and enable the following events:
`subscription_created`, `subscription_activated`, `payment_succeeded`,
`subscription_cancelled`.

**Step 3 — Drive a test checkout:**

Visit `http://localhost:3000` and click **Sign Up**. Complete a test checkout
using a Chargebee test card.

**Expected result:** Events appear in `.data/webhook-log-chargebee.json` and
are printed to the dev-server console as `[chargebee-webhook] Received <event>`.

---

### Paddle

**Env vars to set in `.env.local`:**

```
BILLING_PROVIDER=paddle
NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN=test_...
PADDLE_PRICE_ID=pri_...
PADDLE_WEBHOOK_SECRET=...   # copied from Paddle dashboard after step 2
```

> This harness uses **Paddle Billing** (the current API), not Paddle Classic.
> Ensure your sandbox account is on Paddle Billing.

**Step 1 — Start ngrok:**

```bash
ngrok http 3000
```

Note the `https://<id>.ngrok-free.app` URL.

**Step 2 — Add a notification destination in the Paddle sandbox:**

In the Paddle sandbox dashboard go to **Developer Tools → Notifications** and
add a new destination:

- **URL:** `https://<id>.ngrok-free.app/api/webhooks/paddle`
- **Events:** `transaction.completed`, `subscription.created`,
  `subscription.updated`, `subscription.canceled`

After saving, copy the **secret key** shown and set it as `PADDLE_WEBHOOK_SECRET`
in `.env.local`, then restart `npm run dev`.

**Step 3 — Drive a sandbox transaction:**

Visit `http://localhost:3000` and click **Sign Up**. Complete a sandbox
transaction using a Paddle test card.

**Expected result:** Events appear in `.data/webhook-log-paddle.json` and are
printed to the dev-server console as `[paddle-webhook] Received <event>`.

---

## affy.pro snippet placement

There are exactly two places to paste affy.pro's snippets. Both are delimited
with comments and contain placeholder `<Script>` elements so the structure is
clear.

### 1. Capture snippet — `app/layout.tsx`

Find the block starting with `── affy.pro capture snippet ──`. Replace the
`dangerouslySetInnerHTML={{ __html: '' }}` content (or the `src` prop) with
the capture snippet from your affy.pro dashboard:

```tsx
// Before (placeholder):
<Script
  id="affy-capture"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{ __html: '' }}
/>

// After (your snippet):
<Script
  id="affy-capture"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{ __html: `/* affy.pro capture code here */` }}
/>
```

`strategy="afterInteractive"` is required — affy.pro's snippet reads and
writes cookies and `localStorage`, which are unavailable during server-side
rendering.

### 2. Conversion snippet — `app/thank-you/page.tsx`

Find the block starting with `── affy.pro conversion snippet ──`. Replace the
`dangerouslySetInnerHTML` content with affy.pro's conversion call.

This page is provider-agnostic — the same snippet fires regardless of whether
Stripe, Chargebee, or Paddle completed the checkout. The existing placeholder
also includes a `console.log('[affy] conversion fired', …)` call so you can
confirm the fire in DevTools without needing a real snippet first.

---

## Switching providers

1. Change `BILLING_PROVIDER` in `.env.local` to `stripe`, `chargebee`, or `paddle`.
2. Restart the dev server (`npm run dev`).
3. Re-run the walkthrough for that provider.

Each provider's webhook endpoint (`/api/webhooks/stripe`, `/api/webhooks/chargebee`,
`/api/webhooks/paddle`) is always live — only the checkout on `/signup` changes
based on `BILLING_PROVIDER`.

---

## Manual verification checklist

Run through this checklist for each provider. Steps are the same across all
three; only the webhook log file name and expected events differ.

### Stripe

- [ ] Visit `http://localhost:3000/?ref=test123` — the DebugPanel (bottom-right)
      shows `cookie: test123` and `storage: test123` after the affy.pro capture
      snippet fires. *(Until the real snippet is pasted, these will show "not
      captured yet" — that is expected.)*
- [ ] Click **Sign Up** — browser redirects to Stripe Checkout.
- [ ] Complete a test payment (use card `4242 4242 4242 4242`) — browser lands
      on `/thank-you`.
- [ ] DevTools console shows `[affy] conversion fired { affiliateId: ..., orderId: ... }`.
- [ ] `.data/webhook-log-stripe.json` contains entries for
      `checkout.session.completed` and `customer.subscription.created`.
- [ ] `/dashboard` shows active provider `stripe` and the recent events.

### Chargebee

- [ ] Visit `http://localhost:3000/?ref=test123` — DebugPanel shows captured ID.
- [ ] Click **Sign Up** — Chargebee checkout opens.
- [ ] Complete a test payment — browser lands on `/thank-you`.
- [ ] DevTools console shows `[affy] conversion fired ...`.
- [ ] `.data/webhook-log-chargebee.json` contains entries for
      `subscription_created` and `payment_succeeded`.
- [ ] `/dashboard` shows active provider `chargebee` and the recent events.

### Paddle

- [ ] Visit `http://localhost:3000/?ref=test123` — DebugPanel shows captured ID.
- [ ] Click **Sign Up** — Paddle checkout overlay appears.
- [ ] Complete a sandbox transaction — browser lands on `/thank-you`.
- [ ] DevTools console shows `[affy] conversion fired ...`.
- [ ] `.data/webhook-log-paddle.json` contains entries for
      `transaction.completed` and `subscription.created`.
- [ ] `/dashboard` shows active provider `paddle` and the recent events.

---

## Known limitations

- **Vercel filesystem is read-only outside `/tmp`.** Webhook logs (`/.data/`)
  only persist reliably in local development. On Vercel, logs will not survive
  cold starts. See [ARCHITECTURE.md §5](./ARCHITECTURE.md#5-known-constraints--non-goals).
- **This harness is a dev tool, not a production app.** `/dashboard` has no
  auth guard. Run it locally; don't expose it publicly.
- **No database, no user accounts.** State is cookies, `localStorage`, and
  flat JSON files. Restarting the dev server does not clear webhook logs;
  use the **Reset all logs** button on `/dashboard` or POST to `/api/reset`.
