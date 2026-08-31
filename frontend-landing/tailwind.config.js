/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
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
        section: {
          alt: '#EFE7D9',
          light: '#FBF8F2',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
