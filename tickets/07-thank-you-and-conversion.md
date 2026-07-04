# Ticket 07 — `/thank-you` + conversion placeholder

## Goal
Add the provider-agnostic post-checkout confirmation page and the
placeholder block where affy.pro's conversion snippet will fire. Identical
across all three providers — that's the invariant the harness exists to
prove.

## In scope
- `app/thank-you/page.tsx`
  - Server component (or client — either is fine; keep it server unless the
    placeholder demands client).
  - Simple "You're in — thanks!" copy.
  - **Clearly delimited placeholder block** for affy.pro's conversion snippet
    using `<Script strategy="afterInteractive">`. Commented banner:
    ```
    {/* ────────────── affy.pro conversion snippet ────────────── */}
    {/* TODO: paste affy.pro's conversion call here. Identical for */}
    {/* all three billing providers by design. */}
    {/* ─────────────────────────────────────────────────────────── */}
    ```
  - Immediately after the placeholder, an inline `<Script>` that runs:
    ```js
    console.log('[affy] conversion fired', { affiliateId, orderId });
    ```
    Read `affiliateId` from cookie / localStorage; read `orderId` from the
    query string if the provider passes one back, else `null`.

## Out of scope
- Real affy.pro snippet — placeholder only.
- Any provider-specific handling on this page. If the user later needs to
  know which provider fired the conversion, they can look at webhook logs;
  the page itself stays provider-agnostic.

## Files touched
- `app/thank-you/page.tsx` (new)

## Steps
1. Create the page with the placeholder + console.log block.
2. From `/signup` in Stripe mode (Ticket 04), complete a test-mode checkout
   and confirm the redirect lands here.
3. Verify the console log fires and shows the affiliate ID (if one was
   captured on the landing page).
4. Commit: `feat: thank-you page with affy conversion placeholder`.

## Acceptance criteria
- Navigating to `/thank-you` directly renders the page and fires the console
  log.
- Placeholder block is visually and semantically obvious in the source.
- Page contains no provider-specific code.

## Dependencies
- Ticket 02.
- Ideally Ticket 04 so you can verify the Stripe redirect end-to-end, but
  not strictly required.
