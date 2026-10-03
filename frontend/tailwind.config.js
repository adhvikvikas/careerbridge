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
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // indigo-600
          dark: '#3730A3', // indigo-800
        },
        navy: {
          DEFAULT: '#0F172A', // slate-900
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F8FAFC', // slate-50
        },
        content: {
          DEFAULT: '#0F172A', // slate-900
          secondary: '#475569', // slate-600
          muted: '#64748B', // slate-500
        },
        border: {
          DEFAULT: '#E2E8F0', // slate-200
        },
        status: {
          success: '#16A34A', // green-600
          warning: '#D97706', // amber-600
          danger: '#DC2626', // red-600
          info: '#2563EB', // blue-600
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
