/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'fixup-green': '#b5d331',
        'fixup-orange': '#f25c05',
        'fixup-blue': '#89b8e5',
        'fixup-black': '#0a0a0a',
        'fixup-white': '#f4f4f4',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin 6s linear infinite reverse',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        coolvetica: ['Coolvetica', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};