/**
 * PartZone design tokens.
 * Source of truth: pending final mockup delivery.
 * Current values are assumptions from the mockup description + logo color spec (#F36F21).
 * Update after design images are reviewed.
 */

export const colors = {
  /** Near-black navy — page background */
  bg: "#0B1220",
  /** Slightly lighter surface — cards, sidebar */
  surface: "#111827",
  /** Hover/active surface */
  surfaceAlt: "#1A2436",
  /** Thin low-contrast border */
  border: "#1F2D3D",
  /** Orange accent — sampled from logo, ~#F36F21 */
  accent: "#F36F21",
  /** Accent hover state */
  accentHover: "#FF8A1F",
  /** Accent foreground (text on accent background) */
  accentFg: "#FFFFFF",
  /** Primary text */
  text: "#F1F5F9",
  /** Secondary / muted text */
  textMuted: "#94A3B8",
  /** Light surface for product photo cards */
  productBg: "#FFFFFF",
  /** Text on product card light surface */
  productText: "#0F172A",
  /** Danger / error */
  danger: "#EF4444",
  /** Success */
  success: "#22C55E",
  /** Warning */
  warning: "#EAB308",
} as const;

export const fontFamily = {
  /** Arabic-first UI font — IBM Plex Sans Arabic, Latin fallback. */
  sans: [
    "IBM Plex Sans Arabic",
    "IBM Plex Sans",
    "ui-sans-serif",
    "system-ui",
    "sans-serif",
  ],
  mono: ["ui-monospace", "SFMono-Regular", "monospace"],
} as const;

export const borderRadius = {
  none: "0px",
  sm: "4px",
  DEFAULT: "8px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  "2xl": "24px",
  full: "9999px",
} as const;

export const spacing = {
  /** Consistent with Tailwind defaults — no custom values needed here */
} as const;

export type ColorKey = keyof typeof colors;
