import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#9ef01a",
          hover: "#ccff33",
          dark: "#7acc00",
        },

        dark: {
          bg: "#0a0f1a",
          secondary: "#0d1526",
          card: "rgba(30, 41, 59, 0.4)",
          border: "rgba(158, 240, 26, 0.12)",
        },

        light: {
          bg: "#ffffff",
          secondary: "#f8fafc",
          text: "#1e293b",
          border: "#e2e8f0",
        },
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },

      boxShadow: {
        neon: "0 0 12px rgba(158,240,26,0.4)",
      },
    },
  },

  plugins: [animate],
};

export default config;
