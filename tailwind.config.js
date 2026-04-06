/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

/** Solarized + site tokens (aligns with layout / components using text-solarized-*) */
const solarized = {
  base03: "#002b36",
  base02: "#073642",
  base01: "#586e75",
  base00: "#657b83",
  base0: "#839496",
  base1: "#93a1a1",
  base2: "#eee8d5",
  base3: "#fdf6e3",
  base03Deep: "#00212b",
  yellow: "#b58900",
  orange: "#cb4b16",
  red: "#dc322f",
  magenta: "#d33682",
  violet: "#6c71c4",
  blue: "#268bd2",
  cyan: "#2aa198",
  green: "#859900",
  accentGh: "#58a6ff",
  blueUi: "#2075c7",
  ghBorder: "#30363d",
  ghWash: "#e6edf3",
  ghInk: "#1f2328",
  ghMuted: "#8b949e",
  ghDim: "#656d76",
  borderLight: "#d0d7de",
  cardWash: "#f6f8fa",
  mist: "#657b83",
};

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        solarized,
        primary: colors.blue,
        secondary: colors.amber,
        sky: colors.sky,
        stone: colors.stone,
        neutral: colors.neutral,
        gray: colors.gray,
        slate: colors.slate,
        background: {
          light: "#f9fafb",
          dark: "#121212",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          light: "#111827",
          dark: "#f3f4f6",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
