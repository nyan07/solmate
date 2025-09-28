/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5958',
        },
        neutral: {
          lightest: '#fff',
          light: '#fff',
          DEFAULT: '000',
          dark: '#000'
        },
        accent: {
          DEFAULT: '#FF5958',
        },
        success: "#798E36",
        warning: "#E4B21D",
        danger: "#BA2B2B",
      },
    },
  },
};
