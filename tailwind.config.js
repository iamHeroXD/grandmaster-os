/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grandmaster OS palette: warm white, charcoal, restrained green, muted red
        charcoal: {
          950: '#0c0d0e',
          900: '#131517',
          850: '#1a1d20',
          800: '#22262a',
          700: '#32373d',
          600: '#484f57',
          500: '#656e79',
          400: '#8b949e',
          300: '#c2c8d0',
          200: '#e1e4e8',
          100: '#f0f2f5',
          50: '#f8f9fa',
        },
        chess: {
          green: '#4e7c59',      // restrained tournament green
          greenDark: '#395c42',
          greenLight: '#62996e',
          red: '#a84242',        // muted mistake red
          redDark: '#833333',
          redLight: '#c95757',
          gold: '#c29b38',       // restrained trophy / mastery accent
          goldMuted: '#947528',
        },
        board: {
          woodLight: '#ecdab9',
          woodDark: '#b88b4a',
          tournamentLight: '#eeeed2',
          tournamentDark: '#769656',
          slateLight: '#dee3e6',
          slateDark: '#8ca1a9',
          monoLight: '#f0f0f0',
          monoDark: '#787878',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
