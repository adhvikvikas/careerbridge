/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#B76E4C', // Muted Terracotta
          dark: '#A05D3D',
        },
        navy: {
          DEFAULT: '#263B4A', // Muted Navy
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F7F5F0', // Warm Ivory
        },
        content: {
          DEFAULT: '#20252B', // Primary Text
          secondary: '#667085', // Secondary Text
          muted: '#667085',
        },
        border: {
          DEFAULT: '#E5E1DA',
          light: '#E5E1DA',
        },
        status: {
          success: '#477A62',
          warning: '#B58A45',
          danger: '#B85C5C',
          info: '#263B4A',
        }
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}
