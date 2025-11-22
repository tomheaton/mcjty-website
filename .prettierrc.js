/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  trailingComma: "all",
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  bracketSpacing: true,
  printWidth: 80,
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
  tailwindConfig: "./www/tailwind.config.ts",
};

module.exports = config;
