/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          yellow: '#F9D342',
          lightYellow: '#FFF9D2',
          cream: '#FFFBEB',
          dark: '#1E232A',
          gray: '#6C7A89',
          border: '#1E232A'
        }
      },
      boxShadow: {
        'pop': '4px 4px 0px #1E232A',
        'pop-lg': '6px 6px 0px #1E232A',
        'pop-sm': '2px 2px 0px #1E232A',
        'pop-pressed': '1px 1px 0px #1E232A',
      },
      fontFamily: {
        bangla: ['"Baloo Da 2"', 'sans-serif'],
        display: ['Fredoka', 'sans-serif']
      }
    },
  },
  plugins: [],
};
