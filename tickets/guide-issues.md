# Integration Guide Issues

## affy.pro — `data-affy.pro` attribute not valid JSX

**Source:** affy.pro dashboard installation guide  
**Affected file:** `app/layout.tsx`

### Problem

The affy.pro guide shows this for Next.js:

```tsx
<Script
  src="https://cdn.affy.pro/js/pixel.min.js"
  data-affy.pro="gObGD0E6X0rv"
  data-cookie_duration="60"
  strategy="afterInteractive"
/>
```

The attribute `data-affy.pro` contains a dot (`.`), which is **not valid JSX syntax**. Turbopack (Next.js 16) rejects it at parse time:

```
Expected '</', got '.'
```

### Fix

Use an inline script via `dangerouslySetInnerHTML` to create the pixel element dynamically and set the attribute via `setAttribute`, which accepts any string:

```tsx
<Script
  id="affy-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      var s=document.createElement('script');
      s.async=true;
      s.src='https://cdn.affy.pro/js/pixel.min.js';
      s.setAttribute('data-affy.pro','gObGD0E6X0rv');
      s.setAttribute('data-cookie_duration','60');
      document.head.appendChild(s);
    `,
  }}
/>
```

The pixel script reads these attributes from the DOM element (via `document.currentScript` or by querying the element), so setting them via `setAttribute` works identically.
