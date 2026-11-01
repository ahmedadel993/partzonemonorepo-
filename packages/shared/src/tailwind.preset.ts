import { colors, fontFamily, borderRadius } from "./tokens.js";
import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        surface: colors.surface,
        "surface-alt": colors.surfaceAlt,
        border: colors.border,
        accent: {
          DEFAULT: colors.accent,
          hover: colors.accentHover,
          fg: colors.accentFg,
        },
        text: {
          DEFAULT: colors.text,
          muted: colors.textMuted,
        },
        "product-bg": colors.productBg,
        "product-text": colors.productText,
        danger: colors.danger,
        success: colors.success,
        warning: colors.warning,
      },
      fontFamily: {
        sans: fontFamily.sans,
        mono: fontFamily.mono,
      },
      borderRadius,
    },
  },
  plugins: [],
};

export default preset;
