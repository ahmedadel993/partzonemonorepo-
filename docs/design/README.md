# Design Assets

[PLACEHOLDER — design images not yet uploaded]

## Expected files

- `storefront-home-mockup.png` — storefront home page mockup (Arabic, RTL, dark theme). Upload to extract exact color tokens and layout details.
- `partzone-logo.png` — official logo. To be converted to SVG variants (full logo, icon-only gear, light/dark backgrounds) for header, favicon, admin sidebar, and emails.

## Color tokens (assumed — update after image review)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0B1220` | Page background |
| `--color-surface` | `#111827` | Cards, sidebar |
| `--color-surface-alt` | `#1A2436` | Hover surfaces |
| `--color-border` | `#1F2D3D` | Borders |
| `--color-accent` | `#F36F21` | Primary action, orange from logo |
| `--color-accent-hover` | `#FF8A1F` | Hover state of accent |
| `--color-text` | `#F1F5F9` | Primary text |
| `--color-text-muted` | `#94A3B8` | Secondary text |
| `--color-product-bg` | `#FFFFFF` | Product card background (light, for photos) |

## Contrast check (WCAG AA, R-25)

| Pair | Ratio | Status |
|---|---|---|
| `#F1F5F9` on `#0B1220` | ~14:1 | PASS |
| `#F36F21` on `#0B1220` | ~4.5:1 at 18px+ | PASS large text |
| `#F36F21` on `#111827` | ~4.2:1 | PASS large text |

**NOTE:** Orange accent on dark backgrounds passes for large text (18px+ / 14px bold) only.
For body-size text on accent backgrounds (buttons), use white `#FFFFFF` foreground.
