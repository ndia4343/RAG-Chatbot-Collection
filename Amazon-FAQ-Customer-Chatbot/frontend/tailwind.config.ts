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
          DEFAULT: "#0ea5e9", // sky blue
          hover: "#38bdf8",
          dark: "#0284c7",
        },

        dark: {
          bg: "#f0f9ff",        // light sky background
          secondary: "#e0f2fe", // soft panels
          card: "#ffffff",
          border: "#bae6fd",
        },

        light: {
          bg: "#ffffff",
          secondary: "#f8fafc",
          text: "#0f172a",
          border: "#e2e8f0",
        },
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },

      boxShadow: {
        neon: "0 0 12px rgba(14,165,233,0.35)",
      },
    },
  },

  plugins: [animate],
};

export default config;
