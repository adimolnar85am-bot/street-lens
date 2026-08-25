import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111111",
          50: "#FAFAF8",
          100: "#F2EFE8",
          200: "#E5E1D8",
          300: "#C7C7C7",
          400: "#999999",
          500: "#777777",
          600: "#555555",
          700: "#444444",
          800: "#333333",
          900: "#222222",
          950: "#111111",
        },
        warm: "#F2EFE8",
        line: "#C7C7C7",
        scarlet: {
          DEFAULT: "#FF2400",
          dark: "#E02000",
        },
        cream: "#F2EFE8",
        // Legacy aliases → scarlet accent
        signal: {
          DEFAULT: "#FF2400",
          light: "#FF4D33",
          dark: "#E02000",
          soft: "rgba(255, 36, 0, 0.1)",
        },
        leica: {
          DEFAULT: "#FF2400",
          dark: "#E02000",
        },
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
