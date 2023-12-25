import { THEME_COLORS } from "./src/utilities/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      ...THEME_COLORS,
      black: "#000",
      white: "#fff"
    },
    fontFamily: {
      sans: ["Tahoma", "sans-serif"],
      mono: ["Courier", "monospace"],
    },
    extend: {},
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
}

