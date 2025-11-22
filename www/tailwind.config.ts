import type { Config } from "tailwindcss";

export default {
  darkMode: ["selector", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx,md,mdx}", "./docs/**/*.{md,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  blocklist: ["container"],
} satisfies Config;
