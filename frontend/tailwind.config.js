/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f5f9',
          100: '#e1ecf3',
          200: '#c3d9e8',
          300: '#a5c6dc',
          400: '#69a0c5',
          500: '#2d7aae',
          600: '#286e9d',
          700: '#225b82',
          800: '#1b4968',
          900: '#163c55',
        },
        primary: {
          50: '#f4f6f8',
          100: '#e3e8ef',
          200: '#cdd5e0',
          300: '#a5b4c8',
          400: '#758ba8',
          500: '#485e7a',  // Deep university slate blue
          600: '#34465d',
          700: '#273549',
          800: '#1f2a3a',
          900: '#151e2a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        accent: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
        }
      },
      boxShadow: {
        'card': '0px 2px 4px rgba(15, 23, 42, 0.04), 0px 4px 6px rgba(15, 23, 42, 0.02)',
        'card-hover': '0px 4px 6px rgba(15, 23, 42, 0.06), 0px 10px 15px rgba(15, 23, 42, 0.04)',
        'dropdown': '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
      },
      // Custom animations for GPU-accelerated performance
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
