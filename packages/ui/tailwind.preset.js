/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#264895',  // main
          600: '#1A3670',
          700: '#153060',
          800: '#102550',
          900: '#0A1A40',
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#0DA342',  // main
          600: '#0A7A32',
          700: '#085C26',
          800: '#064E20',
          900: '#03391A',
        },
        accent: {
          pink: '#E61562',
          orange: '#F29315',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
