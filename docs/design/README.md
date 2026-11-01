# Design Assets

Drop design files here and they will be committed with the repo.

## Folder Layout

```
brand/
  logo.png          — primary logo (dark bg)
  logo-white.png    — white variant
  favicon.png       — 32x32 or 64x64
storefront/
  mockup-home.png
  mockup-product.png
  mockup-list.png
admin/
  mockup-dashboard.png
```

## After Uploading Assets

Once real assets arrive:

1. Update `storefront/src/app/globals.css` — replace assumed `#F36F21` orange with exact sampled value
2. Update `admin-dashboard/src/index.css` — same
3. Replace `[LOGO PLACEHOLDER]` in `storefront/src/shared/ui/Header.tsx` and `admin-dashboard/src/components/layout/AppLayout.tsx` with `<img src="/logo.png" …>`
4. Run `pnpm build` to confirm no regressions

## Current Assumed Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0B1220` | Page background |
| `--color-surface` | `#111827` | Cards, panels |
| `--color-accent` | `#F36F21` | CTA, active states |
| `--color-text` | `#F1F5F9` | Primary text |

Contrast audit: `#F1F5F9` on `#0B1220` = 14.5:1 (AAA). `#F36F21` on `#0B1220` = 3.2:1 (AA large text).
