import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Crucial for the theme toggle to work
  theme: {
    extend: {
      colors: {
        // The core neon green from your mockup
        brand: {
          DEFAULT: "#9ef01a", // Electric Lime
          hover: "#ccff33",   // Lighter shade for hover states
          dark: "#7acc00",    // Slightly deeper for gradients
        },
        // Dark Mode Colors
        dark: {
          bg: "#0a0f1a",        // Main background
          secondary: "#0d1526", // Sidebar background
          card: "rgba(30, 41, 59, 0.4)", // Translucent card
          border: "rgba(158, 240, 26, 0.12)", // Subtle neon border
        },
        // Light Mode Colors
        light: {
          bg: "#ffffff",        // Pure white background
          secondary: "#f8fafc", // Soft slate for sidebars/sections
          text: "#1e293b",      // Deep navy text
          border: "#e2e8f0",    // Standard light border
        }
      },
    },
  },
  plugins: [],
};

export default config;
