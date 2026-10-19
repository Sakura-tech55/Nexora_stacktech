import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  corePlugins: {
    // app/globals.scss and Chakra UI provide the reset
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07090d",
          900: "#0b0e14",
          800: "#121212",
        },
        nexora: {
          blue: "#2f7bff",
          deep: "#0d3a9e",
          glow: "#7cc4ff",
          red: "#e81c3c",
        },
      },
      fontFamily: {
        serifEn: ["var(--font-cormorant)", "serif"],
        serifJa: ["var(--font-mincho)", "serif"],
        sans: ["var(--font-noto)", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(520%)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "glow-pulse": "glow-pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
