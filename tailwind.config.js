/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#F2A7B0',
          dark: '#E07D8A',
          pale: '#FDF0F2',
        },
        blush: '#FAE3E7',
        ink: '#1C1018',
        muted: '#8C7580',
        line: '#EDD8DC',
      },
      fontFamily: {
        sans: ['DMSans_400Regular', 'sans-serif'],
        'sans-medium': ['DMSans_500Medium', 'sans-serif'],
        'sans-bold': ['DMSans_700Bold', 'sans-serif'],
        serif: ['DMSerifDisplay_400Regular', 'serif'],
        'serif-italic': ['DMSerifDisplay_400Regular_Italic', 'serif'],
      },
    },
  },
  plugins: [],
};
