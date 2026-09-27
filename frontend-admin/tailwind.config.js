/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // El panel usa la paleta de marca fija; los colores editables solo se aplican al landing.
      colors: {
        surface: '#f4f4f4',
        card: '#ffffff',
        sidebar: '#000000',
        primary: {
          DEFAULT: '#f89e1b',
          hover: '#e08a0c',
          // Naranja oscurecido para texto sobre fondo claro: el de marca no alcanza contraste legible.
          strong: '#9c5800',
        },
        secondary: {
          DEFAULT: '#000000',
          soft: '#333333',
          muted: '#5c5c5c',
          subtle: '#6b6b6b',
        },
        tertiary: '#ffffff',
      },
      fontFamily: {
        display: ['"League Gothic"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        sans: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
