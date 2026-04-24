/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          dark: '#1A1A1A',
          page: '#F0F2F5',
          panel: '#3D4140',
          input: '#2C2F2E',
          text: '#2C2F2E',
          muted: '#9C9A9A',
          ivory: '#F5F0E8',
          brand: '#4A7C59',
          'brand-hover': '#3D6849',
        },
      },
    },
  },
  plugins: [],
}