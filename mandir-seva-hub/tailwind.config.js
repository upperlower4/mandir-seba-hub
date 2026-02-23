/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#fff8f0',
          100: '#fff3e0',
          200: '#ffe0b2',
          300: '#ffb347',
          400: '#FF9933',
          500: '#f57c00',
          600: '#e65c00',
          700: '#bf360c',
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", 'serif'],
        body:    ["'Lato'", 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
