import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../packages/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          blue: "#1B2A4A",
        },
        blueprint: "#2F5D8A",
        accent: {
          DEFAULT: "#B8894F",
          dark: "#8A6031",
          soft: "#E8D9C3",
        },
        rating: {
          gold: "#E8A845",
        },
        slate: {
          900: "#1F2430",
          800: "#2D3340",
          700: "#3D4455",
          600: "#5B6270",
          500: "#737A87",
          400: "#9199A8",
          300: "#B8BEC8",
          200: "#E7E9ED",
          100: "#F1F2F5",
          50: "#F8F9FB",
        },
        paper: "#FAF9F6",
        surface: "#FFFFFF",
        success: {
          DEFAULT: "#1F8A5F",
          soft: "#E1F3EA",
        },
        danger: {
          DEFAULT: "#C2410C",
          soft: "#FBE7DD",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
        "card-xl": "24px",
        pill: "999px",
        image: "16px",
        "image-xl": "20px",
        input: "10px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(27, 42, 74, 0.08)",
        "card-hover": "0 8px 24px rgba(27, 42, 74, 0.14)",
        "sticky-bar": "0 -4px 16px rgba(27, 42, 74, 0.10)",
        "accent-button": "0 4px 14px rgba(184, 137, 79, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
