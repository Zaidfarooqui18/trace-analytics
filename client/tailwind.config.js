/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          light: '#EEF3F8',
          'light-card': '#ffffff',
          'light-border': '#e2e8f0',
          dark: '#0f172a',
          'dark-card': '#1e293b',
          'dark-border': '#334155',
        },
        pastel: {
          sky: '#87CEEB',
          green: '#90EE90',
          pink: '#FFB6C1',
          purple: '#DDA0DD',
          yellow: '#F0E68C',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 10px 25px -5px rgba(56, 120, 245, 0.05), 0 8px 16px -6px rgba(148, 163, 184, 0.12)',
        soft: '0 10px 25px -5px rgba(56, 120, 245, 0.05), 0 8px 16px -6px rgba(148, 163, 184, 0.12)',
        raised: '0 4px 14px -2px rgba(148, 163, 184, 0.18), 0 2px 6px -1px rgba(148, 163, 184, 0.1)',
        'soft-btn': '0 6px 18px -2px rgba(56, 120, 245, 0.32), 0 2px 6px -1px rgba(56, 120, 245, 0.18)',
        inset: 'inset 0 2px 4px 0 rgba(148, 163, 184, 0.12)',
        glow: '0 0 20px -3px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [],
};
