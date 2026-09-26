/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4ede4',
          200: '#e8dbcd',
          300: '#d6beab',
          400: '#bc9c83',
          500: '#a37e63',
          600: '#89644e',
          700: '#6f4f3e',
          800: '#5c4236',
          900: '#4c372f',
        },
        amber: {
          warm: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(22, 101, 52, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(22, 163, 74, 0.25)',
      }
    },
  },
  plugins: [],
}
