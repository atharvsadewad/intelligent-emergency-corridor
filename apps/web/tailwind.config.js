/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          DEFAULT: '#dc2626', // Red accent
          light: '#fef2f2',
          border: '#fca5a5'
        },
        cleared: {
          DEFAULT: '#16a34a', // Green status
          light: '#f0fdf4',
          border: '#86efac'
        },
        warning: {
          DEFAULT: '#d97706', // Amber warning
          light: '#fffbeb',
          border: '#fcd34d'
        }
      }
    },
  },
  plugins: [],
}
