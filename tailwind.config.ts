import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:  "#1A6B3C",
        deep:    "#0F3D22",
        amber:   "#E8941A",
        amber2:  "#C27A10",
        cream:   "#F7F3EC",
        ink:     "#1A1208",
        ash:     "#8B7355",
        snow:    "#FDFAF5",
      },
      fontFamily: {
        serif: ["DM Serif Display", "Georgia", "serif"],
        sans:  ["Inter", "system-ui", "sans-serif"],
        mono:  ["Space Mono", "monospace"],
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};

export default config;