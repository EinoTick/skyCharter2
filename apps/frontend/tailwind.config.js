/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        sky: {
          primary: '#2563EB',
          'primary-content': '#FFFFFF',
          secondary: '#0EA5E9',
          'secondary-content': '#FFFFFF',
          accent: '#22C55E',
          'accent-content': '#062A12',
          neutral: '#111827',
          'neutral-content': '#F9FAFB',
          'base-100': '#FFFFFF',
          'base-200': '#F1F5F9',
          'base-300': '#E2E8F0',
          'base-content': '#0F172A',
          info: '#0EA5E9',
          'info-content': '#FFFFFF',
          success: '#16A34A',
          'success-content': '#FFFFFF',
          warning: '#F59E0B',
          'warning-content': '#111827',
          error: '#EF4444',
          'error-content': '#FFFFFF',
        },
      },
      'dark',
      'light',
    ],
    defaultTheme: 'sky',
  },
}
