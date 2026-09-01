/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: '#F1EDE5',
        card: '#FBF8F2',
        sidebar: '#16130F',
        cream: '#F6F1E8',
        ink: {
          DEFAULT: '#16130F',
          soft: '#40382D',
          muted: '#6B5C47',
          subtle: '#7A6A55',
        },
        terracotta: {
          DEFAULT: '#B0492B',
          hover: '#8A3720',
        },
        gold: '#D9A257',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
