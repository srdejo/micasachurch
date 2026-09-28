/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Mismos tokens que el landing: el acento sigue al tema activo (BrandThemeService), los neutros son fijos.
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
        },
        cream: {
          DEFAULT: '#FAF8F4',
          2: '#F1EDE5',
          3: '#E9E1D3',
          4: '#FBF8F2',
          5: '#FFFDF9',
        },
        paper: '#F7F5F0',
        body: '#4A4744',
        muted: '#5B5750',
        faint: '#8A7A63',
        success: '#6FCF97',
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
