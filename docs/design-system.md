# PartZone Design System

## Anti-Slop Declaration

**Dials:**
- ENERGY 2 (Balanced) — e-commerce builds trust; avoid loud hype
- RHYTHM 2 (Consistent with breaks) — product grid is uniform; hero and feature sections vary
- MOTION 2 (Scroll-reveal + transitions) — no bounce/float; transitions on cart drawer and page reveals

**Brand statement:** Arabic-first auto parts marketplace. Dark navy background, orange accent from logo, light card surfaces for product photos. IBM Plex Sans Arabic chosen for its Arabic-first design and variable weight range.

## Color Tokens

See `docs/design/README.md` for the full token table and contrast audit.

All colors are defined as CSS custom properties in `storefront/src/app/globals.css` (`@theme` block) and in `packages/shared/src/tokens.ts` for TypeScript access.

## Typography

| Use | Font | Weight | Size |
|---|---|---|---|
| Display headings | IBM Plex Sans Arabic | 700 | 32–48px |
| Section headings | IBM Plex Sans Arabic | 600 | 20–28px |
| Body | IBM Plex Sans Arabic | 400 | 14–16px |
| Labels / UI | IBM Plex Sans Arabic | 500 | 12–14px |

Reason for font choice: IBM Plex Sans Arabic is purpose-built for Arabic UI, covers Latin with the same weight range, avoids the "AI default Inter" anti-pattern (R-06), and is free/variable.

## RTL Rules

- Use logical CSS everywhere: `ms-`, `me-`, `ps-`, `pe-`, `start`, `end`
- Never use `left`/`right` in Tailwind classes (use `s-`/`e-` equivalents)
- Arabic (`ar`) is the default locale; `dir="rtl"` is default
- English (`en`) switches to `dir="ltr"` via Next.js middleware + locale layout

## Component Guidelines (Anti-Slop UI Checklist)

- [ ] R-02: No em dash in any text — use comma, colon, or parentheses
- [ ] R-03: Mobile tap targets min 44px; no horizontal overflow
- [ ] R-05: No "Hero + 3 identical cards" layout — hero is dynamic; sections vary
- [ ] R-11: Not every element pill-shaped; consistent radius from design tokens
- [ ] R-15: No generic CTAs ("Get Started", "Learn More") — use Arabic: "أضف إلى السلة", "تسوق الآن"
- [ ] R-17: No fake statistics — show only real data or explicitly labeled placeholder
- [ ] R-23: Use `[LOGO]`, `[PRODUCT IMAGE]` placeholders until final assets arrive
- [ ] R-25: WCAG AA contrast on all text pairs (checked in design/README.md)
- [ ] R-26: Every interactive element has a real route/action; no dead links
- [ ] R-27: Empty, loading, and error states for every data-displaying component
- [ ] R-32: No `outline: none` without a better custom focus indicator
- [ ] R-39: Buttons are `<button>`, navigation is `<a href>`; every form field has `<label>`
- [ ] R-40: Hero image: `fetchpriority="high"`, no `loading="lazy"` on LCP

## Page Block Binding Types

The Marketing module supports binding blocks to:
- `None` — static/promotional block
- `Category` — links to a category listing page
- `Brand` — links to a brand (part manufacturer) page
- `Product` — links to a specific product
- `VehicleMake` — filters by vehicle make (Toyota, Kia, etc.)
- `VehicleModel` — filters by vehicle model
- `Url` — arbitrary URL (external or internal)

## MOTION 2 Scope

Scope: scroll-reveal on entry + purposeful transitions. No bounce, float, or gratuitous animation.

| Component | Technique | Trigger | Duration |
|---|---|---|---|
| `ProductCard` | `opacity-0 → opacity-100` + `translateY(24px) → 0` | Intersection Observer (threshold 0.1, rootMargin -40px) | 500ms ease-out |
| Filter panel (future) | `translateX(-100%) → 0` | Toggle click | 300ms ease-out |
| Product gallery | Cross-fade between images (`opacity` swap) | Thumbnail click | 400ms ease-in-out |
| Cart drawer (future) | `translateX(100%) → 0` | Add-to-cart / cart icon | 300ms ease-out |

**Implementation notes:**
- Intersection Observer is created in `useEffect`, disconnected after first intersection (`observer.disconnect()`)
- `priority={true}` prop skips the observer and shows the card immediately for above-the-fold items (first 8 on list pages)
- CSS transitions are set on the element, not via JS — ensures graceful degradation if JS is slow
- No `will-change: transform` added globally; only consider it per-component if profiling shows paint cost
