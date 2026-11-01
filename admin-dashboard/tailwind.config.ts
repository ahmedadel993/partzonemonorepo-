import type { Config } from "tailwindcss";
import partzonePreset from "@partzone/shared/tailwind-preset";

const config: Config = {
  presets: [partzonePreset as Config],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
};

export default config;
