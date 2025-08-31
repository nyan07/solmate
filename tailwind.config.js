/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#909cc2ff',
        },
        neutral: {
          lightest: '#FCFBF5',
          light: '#f2eacfff',
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
