// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "../server/routes/**/*.js",
    "./public/index.html",
  ],
  theme: {
    extend: {
      keyframes: {
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeout: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadein: 'fadein 0.5s ease forwards',
        fadeout: 'fadeout 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}
