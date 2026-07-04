# Ticket 02 — Shared foundation

## Goal
Land the two library modules every later ticket depends on
(`lib/billing/provider.ts`, `lib/log/webhook-log.ts`), the root layout with
the affy.pro **capture** placeholder, and the full `.env.example`.

## In scope
- `lib/billing/provider.ts`
  - Exports a `Provider` type (`'stripe' | 'chargebee' | 'paddle'`).
  - Reads `process.env.BILLING_PROVIDER`, validates it, throws a descriptive
    error on invalid values.
  - Exposes a helper that reports which env vars the active provider
    requires — used later by the dashboard to render missing-env warnings.
    Does **not** throw on missing provider env vars (dashboard needs to
    render the warning, not crash).
- `lib/log/webhook-log.ts`
  - `append(provider, event)` — appends to `.data/webhook-log-<provider>.json`.
    Creates the file and `.data/` dir on first write. Format: a JSON array
    of `{ receivedAt: ISO string, event: <raw parsed payload> }`.
  - `read(provider, limit?)` — reads the array, returns most-recent-first,
    optional cap.
  - `clear(provider)` — truncates to `[]`.
  - All disk I/O is `fs/promises`; module works fine at runtime `nodejs`.
- `app/layout.tsx`
  - Tailwind base already in place from Ticket 01.
  - Add a **clearly delimited placeholder block** for affy.pro's capture
    snippet using Next.js `<Script strategy="afterInteractive">`. The block
    is commented so it's obvious this is where the user pastes affy.pro's
    real snippet. Do **not** invent one; keep it as a commented `TODO`
    banner and an empty `<Script>` slot.
- `.env.example` — full matrix from ARCHITECTURE.md §4, grouped by provider,
  with `AFFY_TRACKING_ID` and `BILLING_PROVIDER` at the top.

## Out of scope
- Any page beyond `layout.tsx` and the default `page.tsx` from Ticket 01.
- Any UI components (DebugPanel is Ticket 03).
- Any webhook route handlers (Tickets 08–10).
- Any provider SDK installs — those land with the ticket that uses them.

## Files touched
- `lib/billing/provider.ts` (new)
- `lib/log/webhook-log.ts` (new)
- `app/layout.tsx` (edit)
- `.env.example` (overwrite with full matrix)

## Steps
1. Implement `lib/billing/provider.ts` per the notes above. Keep it small —
   no factories, no classes.
2. Implement `lib/log/webhook-log.ts` with `append`, `read`, `clear`. Use
   `path.join(process.cwd(), '.data', ...)` for the file path.
3. Edit `app/layout.tsx`:
   - Import `Script` from `next/script`.
   - Add a big commented banner like `{/* ── affy.pro capture snippet ── */}`
     with a TODO explaining what goes here, and an empty `<Script>` slot.
4. Replace `.env.example` with the full block from ARCHITECTURE.md §4.
5. `npm run build` to confirm no type errors.
6. Commit: `feat: provider resolver, webhook log, tracking placeholder`.

## Acceptance criteria
- Importing `lib/billing/provider.ts` with `BILLING_PROVIDER=stripe` returns
  `'stripe'`; with an invalid value throws.
- `append('stripe', { foo: 1 })` creates `.data/webhook-log-stripe.json`
  containing a one-element array.
- `read('stripe', 1)` returns the most recent entry.
- `clear('stripe')` truncates to `[]`.
- `app/layout.tsx` contains a clearly commented affy.pro capture placeholder.
- `.env.example` matches ARCHITECTURE.md §4 exactly.

## Dependencies
- Ticket 01.
