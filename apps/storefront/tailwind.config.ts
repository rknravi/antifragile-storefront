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
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
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
