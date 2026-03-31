/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f3f5fb',
          100: '#e5e9f5',
          200: '#ced4e9',
          300: '#adb7d6',
          400: '#8f9bc1',
          DEFAULT: '#909cc2',
          500: '#6979b0',
          600: '#4a5c96',
          700: '#374676',
          800: '#263154',
          900: '#171e36',
          950: '#0f1424',
        },
        neutral: {
          lightest: '#fff',
          light: '#f2eacfff',
          DEFAULT: 'gray',
          dark: '#0d0a1aff'
        },
        accent: {
          DEFAULT: '#ff5959ff',
        },
        success: "#798E36",
        warning: "#E4B21D",
        danger: "#BA2B2B",
      },
    },
  },
};
