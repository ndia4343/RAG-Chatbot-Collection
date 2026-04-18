/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{js,ts,css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9ef01a", // This defines your signature Lime Green color
      },
    },
  },
  plugins: [],
}
