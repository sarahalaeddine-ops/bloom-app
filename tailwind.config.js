/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bloom: {
          bg:      "#FAF7F4",
          card:    "#FFFFFF",
          border:  "#E8E0DB",
          surface: "#F0EBE8",
          accent:  "#9B6DC5",
          deep:    "#7C3AED",
          rose:    "#E07A8A",
          teal:    "#4ABFB0",
          gold:    "#C49A3C",
          text:    "#1A1014",
          muted:   "#7A6880",
          dim:     "#C5B8CC",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans:  ["DM Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
