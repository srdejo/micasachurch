/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // El acento viene del tema activo (variables CSS que cambia el admin); los neutros son fijos.
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          deep: 'var(--accent-deep)',
          soft: 'var(--accent-soft)',
        },
        ink: {
          DEFAULT: '#111110',
          2: '#1C1B19',
          3: '#2A2926',
          4: '#2E2C29',
        },
        cream: {
          DEFAULT: '#FAF8F4',
          2: '#F1EEE8',
          3: '#E6E1D8',
          4: '#FBF8F2',
        },
        paper: '#F7F5F0',
        body: '#4A4744',
        muted: '#5B5750',
        danger: '#b42318',
      },
      fontFamily: {
        display: ['Dharma', 'Oswald', 'Impact', '"Arial Narrow"', 'sans-serif'],
        sans: ['Gotham', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
