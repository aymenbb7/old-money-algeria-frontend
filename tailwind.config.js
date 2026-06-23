/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        text: "var(--color-text)",
        accent: "var(--color-accent)",
        cards: "var(--color-cards)",
        primary: "var(--color-primary)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        success: "#0B4D2B",
        error: "#ff4d4d",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}
