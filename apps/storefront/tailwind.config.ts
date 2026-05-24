import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          night: "#5B4B8A",
          fresh: "#1E4A6E",
          aqua: "#7EB8C4",
          mist: "#E8F4F8",
          sand: "#FAF8F5",
        },
        rays: {
          black: "#0A0A0A",
          white: "#FAF8F5",
          cream: "#F5F0E8",
          accent: "#FF5C00",
          "accent-light": "#FFB380",
          gray: "#8A6B55",
          line: "#E8DDD4",
          surface: "#F0EBE3",
        },
      },
      fontSize: {
        "product-title": ["1.3125rem", { lineHeight: "1.35", letterSpacing: "-0.02em", fontWeight: "600" }],
        "pdp-title": ["2.25rem", { lineHeight: "1.12", letterSpacing: "-0.03em", fontWeight: "600" }],
        "pdp-title-lg": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "600" }],
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        rays: ["var(--font-rays-display)", "system-ui", "sans-serif"],
        "rays-sans": ["var(--font-rays-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(126, 184, 196, 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(91, 75, 138, 0.12), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
