import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        surface: "#141b23",
        surface2: "#1c2630",
        border: "#26323d",
        accent: "#4ade80",
        accent2: "#38bdf8",
        muted: "#8b9bab",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
