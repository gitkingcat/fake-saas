# Ticket 03 — Landing page + DebugPanel

## Goal
Replace the default `create-next-app` home page with a credible SaaS landing
(hero + 3-tier pricing + "Sign Up" CTA), and add the shared `DebugPanel`
component that surfaces the captured affiliate ID for quick verification.

## In scope
- `app/page.tsx`
  - Hero section with a placeholder product name (e.g. "TestFlow").
  - Three pricing cards (Starter / Pro / Enterprise) — copy is throwaway,
    just enough to look real.
  - "Sign Up" CTA on each card links to `/signup` **preserving** any
    `?ref=` / `?aff=` from the current URL. Server component reads
    `searchParams`; passes forward as query string.
  - Includes `<DebugPanel />` near the bottom.
- `components/DebugPanel.tsx`
  - **Client component** (`'use client'`).
  - Reads affiliate ID from cookie (name TBD by affy.pro's snippet — use a
    reasonable default like `aff_ref` and put a comment noting to update it
    when affy.pro's real cookie name is confirmed) **and** from
    `localStorage`.
  - Shows both values, with a "not captured yet" state.
  - Includes a **manual conversion trigger** button that `POST`s to
    `/api/simulate-conversion` (the endpoint lands in Ticket 11 — until
    then the button will 404, which is fine and expected). This matches
    `GENERAL_IDEA.md` "Debug panel showing captured affiliate ID and a
    manual conversion trigger" and `ARCHITECTURE.md` §2.
  - Small "DEV" badge; styled to look like a debug widget, not primary UI.
  - Used on landing + will be reused on `/dashboard` in Ticket 11.

## Out of scope
- The `/api/simulate-conversion` endpoint itself — that lands in Ticket 11.
  The button in DebugPanel targets the URL now; it'll start working when
  Ticket 11 wires the route up.
- Any actual affy.pro cookie writing — that's affy.pro's snippet's job.
- Styling polish beyond "looks credible".

## Files touched
- `app/page.tsx` (overwrite the scaffold home)
- `components/DebugPanel.tsx` (new)

## Steps
1. Draft `app/page.tsx` as an async server component that reads
   `searchParams` and forwards `ref`/`aff` into the `/signup` href.
2. Add hero + 3 pricing cards with Tailwind classes. Keep copy minimal.
3. Implement `components/DebugPanel.tsx` as a client component that reads
   the cookie + `localStorage` on mount (`useEffect`), stores in state,
   renders the two values, and renders a "Simulate conversion" button
   that `POST`s to `/api/simulate-conversion`.
4. Mount `<DebugPanel />` on `app/page.tsx`.
5. Verify the CTA preserves query params:
   - Visit `/?ref=abc123` → CTA href should be `/signup?ref=abc123`.
   - Visit `/?aff=xyz` → CTA href should be `/signup?aff=xyz`.
6. Commit: `feat: landing page and debug panel`.

## Acceptance criteria
- Landing renders hero + 3 pricing cards.
- `?ref=` and `?aff=` on the landing propagate into the `/signup` link.
- DebugPanel renders and correctly shows "not captured yet" when no cookie /
  storage is set.
- DebugPanel renders a "Simulate conversion" button that fires a POST to
  `/api/simulate-conversion` (route lands in Ticket 11).
- No hydration warnings in console.

## Dependencies
- Ticket 02.
