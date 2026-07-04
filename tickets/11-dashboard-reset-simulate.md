# Ticket 11 — Dashboard + reset + simulate

## Goal
Ship the dev-only `/dashboard`, plus the two supporting endpoints
(`/api/reset` and `/api/simulate-conversion`) that make the dashboard's
controls work.

## In scope
- `app/api/reset/route.ts`
  - `POST`. Truncates all three webhook log files via `webhookLog.clear(p)`
    for each provider.
  - Returns `{ ok: true, cleared: ['stripe', 'chargebee', 'paddle'] }`.
- `app/api/simulate-conversion/route.ts`
  - `POST`. Appends a synthetic event to the **active** provider's log
    (`{ synthetic: true, receivedAt, affiliateId }`) so the affy.pro
    conversion path can be exercised without a real checkout.
  - Body optionally carries `{ affiliateId }`.
- `app/dashboard/page.tsx`
  - Big "DEV ONLY" banner at the top.
  - Server component that:
    - Calls `getActiveProvider()`; displays it.
    - Displays any missing-required-env-vars warning for the active
      provider.
    - Reads the last N (default 10) events from the active provider's log
      via `webhookLog.read(p, 10)`, renders each as a collapsible JSON block.
  - Includes `<DebugPanel />` (reused from Ticket 03). DebugPanel already
    provides the "Simulate conversion" button — do not duplicate it on the
    dashboard.
  - Includes a "Reset all logs" button → `POST /api/reset`, then refreshes.
  - Not linked from anywhere in the app — users navigate to `/dashboard`
    directly.

## Out of scope
- Auth on `/dashboard` — the whole app is a dev harness.
- Cross-provider log view — the dashboard shows only the active provider's
  log (matches how the user thinks about testing one provider at a time).
- Any styling beyond functional.

## Files touched
- `app/api/reset/route.ts` (new)
- `app/api/simulate-conversion/route.ts` (new)
- `app/dashboard/page.tsx` (new)

## Steps
1. Implement `/api/reset`. Verify with `curl -X POST localhost:3000/api/reset`.
2. Implement `/api/simulate-conversion`. Verify a synthetic entry lands in
   the active provider's log.
3. Build `/dashboard` — server-render the log list, hook up the "Reset all
   logs" button as a client component / server action. The "Simulate
   conversion" button already lives in DebugPanel (Ticket 03) and starts
   working now that `/api/simulate-conversion` exists.
4. Manually verify with each `BILLING_PROVIDER` value that:
   - Correct provider is displayed.
   - Missing-env warning appears when relevant.
   - Log view shows recent events.
   - Reset button clears logs; DebugPanel's simulate button appends a
     synthetic event to the active provider's log.
5. Commit: `feat: dashboard, reset, simulate-conversion`.

## Acceptance criteria
- `POST /api/reset` clears all three log files.
- `POST /api/simulate-conversion` appends one synthetic entry to the active
  provider's log.
- `/dashboard` renders the active provider, missing-env warnings, last N
  events, DebugPanel (which owns the simulate button), and a "Reset all
  logs" button.

## Dependencies
- Tickets 02, 03. Ideally also 08–10 so there's something in the logs to
  view, but not blocking.
