/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk theme colors
        'cyber-dark-blue': '#000428',
        'cyber-blue': '#004e92',
        'cyber-purple': '#4700D8',
        'cyber-violet': '#9900F0',
        'cyber-pink': '#F900BF',
        'cyber-light-pink': '#FF85B3',
      },
      animation: {
        'pulse-subtle': 'pulse 2s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'fadeIn': 'fadeIn 0.5s ease-in',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      fontFamily: {
        'teodor': ['var(--font-teodor)'],
        'teodor-italic': ['var(--font-teodor-italic)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}