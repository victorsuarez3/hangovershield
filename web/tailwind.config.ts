import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "serenity-mint": "rgb(214 245 234)",
        "soft-sky-blue": "rgb(207 232 255)",
        "calm-sand": "rgb(246 239 230)",
        "deep-teal": "rgb(15 63 70)",
        "white-pure": "rgb(255 255 255)",
        "glow-coral": "rgb(255 154 139)",
        "lime-mist": "rgb(233 255 204)",
        "text-dark": "rgb(27 27 31)",
        "text-body": "rgb(106 106 109)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
        "3xl": ["30px", "36px"],
        "4xl": ["36px", "44px"],
        "5xl": ["48px", "52px"],
        "6xl": ["56px", "64px"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(145deg, rgb(207 232 255) 0%, rgb(214 245 234) 40%, rgb(255 255 255) 100%)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
