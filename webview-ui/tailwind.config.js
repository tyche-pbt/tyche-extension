import { THEME_COLORS } from "./src/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: THEME_COLORS,
    extend: {},
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
}

