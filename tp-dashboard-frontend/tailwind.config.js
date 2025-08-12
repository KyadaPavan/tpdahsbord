/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '70%': '72%',
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        'fill-line': 'fill-line 8s ease-in-out infinite',
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        'fill-line': {
          '0%': { width: '0%', left: '0' },
          '50%': { width: '100%', left: '0' },
          '51%': { width: '100%', right: '0' },
          '100%': { width: '0%', right: '0' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}