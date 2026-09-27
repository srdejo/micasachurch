/** @type {import('tailwindcss').Config} */
const mix = (color, percent, base) => `color-mix(in srgb, var(${color}) ${percent}%, var(${base}))`;

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Los tonos derivados se calculan sobre las tres variables de marca para que sigan
      // siendo coherentes cuando el admin cambia los colores.
      colors: {
        primary: {
          DEFAULT: 'var(--brand-primary)',
          hover: mix('--brand-primary', 82, '--brand-secondary'),
        },
        secondary: {
          DEFAULT: 'var(--brand-secondary)',
          soft: mix('--brand-secondary', 80, '--brand-tertiary'),
          muted: mix('--brand-secondary', 64, '--brand-tertiary'),
          subtle: mix('--brand-secondary', 54, '--brand-tertiary'),
        },
        tertiary: 'var(--brand-tertiary)',
        danger: '#b42318',
        surface: {
          alt: mix('--brand-secondary', 5, '--brand-tertiary'),
          light: mix('--brand-secondary', 2, '--brand-tertiary'),
        },
      },
      fontFamily: {
        display: ['"League Gothic"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        sans: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
