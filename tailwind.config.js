module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        darkBg: '#0f0b16',
        glass: 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        sm: '4px',
      },
    },
  },
  plugins: [],
};
