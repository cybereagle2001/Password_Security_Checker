/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional: reinforce your preferred scheme
        primary: {
          500: '#2563eb', // blue-600
          600: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
