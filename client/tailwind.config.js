/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron:  { DEFAULT: "#F7941D", dark: "#D4780A", light: "#FBB04C" },
        gold:     { DEFAULT: "#D4A017", light: "#F0C040" },
        deep:     { DEFAULT: "#0A0818", 2: "#110F24", 3: "#1A1635" },
        cream:    { DEFAULT: "#FFF8F0", muted: "#C8BAA8" },
        crimson:  { DEFAULT: "#C1272D" },
        teal:     { DEFAULT: "#1ABC9C" },
        surface:  { DEFAULT: "#1C1535", 2: "#251E42", 3: "#2E2650" },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body:    ["DM Sans", "sans-serif"],
        hindi:   ["Tiro Devanagari Hindi", "serif"],
      },
      animation: {
        "spin-slow":   "spin 60s linear infinite",
        "float":       "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 3s infinite",
        "marquee":     "marquee 35s linear infinite",
        "pulse-glow":  "pulseGlow 3s ease-in-out infinite",
        "fade-up":     "fadeUp 0.8s ease forwards",
      },
      keyframes: {
        float:    { "0%,100%": { transform: "translateY(0) rotate(-2deg)" }, "50%": { transform: "translateY(-24px) rotate(2deg)" } },
        marquee:  { "0%":  { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        pulseGlow:{ "0%,100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        fadeUp:   { from: { opacity: "0", transform: "translateY(32px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
