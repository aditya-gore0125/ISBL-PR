/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF6EF',
        gold: '#C29D5D',
        'gold-dark': '#9C7A3F',
        blush: '#DDA8B2',
        charcoal: '#332822',
        maroon: '#7B2D3A',
      },
      boxShadow: {
        soft: '0 24px 60px rgba(51, 40, 34, 0.08)',
      },
      borderRadius: {
        soft: '1rem',
      },
    },
  },
  plugins: [],
};
