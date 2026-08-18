/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Yeh line important hai, ye Tailwind ko React files padhne bolegi
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

