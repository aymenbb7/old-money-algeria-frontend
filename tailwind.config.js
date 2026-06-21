/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B4D2B",
        accent: "#D4AF37",
        "bg-dark": "#0A0A0A",
        "text-light": "#F5F0E8",
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
