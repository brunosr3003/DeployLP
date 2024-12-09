// tailwind.config.js

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "460px",
      },
      colors: {
        primary: "#FF7B07",
        secundary: "#1E3465", // Erro: "secundary" deveria ser "secondary"
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "20px",
        md: "40px",
      },
      maxWidth: "100%",
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#078bff",
          "secondary": "#1E3465",
          "accent": "#37CDBE",
          "neutral": "#3D4451",
          "base-100": "#FFFFFF",
          "info": "#2094f3",
          "success": "#009485",
          "warning": "#FF9900",
          "error": "#FF5724",
        },
      },
    ],
  },
};
