import type { Config } from "tailwindcss";
import { BRAND_COLORS, TYPOGRAPHY } from "@shalkaar/shared-types";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: BRAND_COLORS.deepIndigo,
          sienna: BRAND_COLORS.burntSienna,
          cream: BRAND_COLORS.offWhite,
          dark: BRAND_COLORS.charcoal,
          accent: BRAND_COLORS.softGold,
        },
      },
      fontFamily: {
        sans: [TYPOGRAPHY.fontFamily.primary, "sans-serif"],
        serif: [TYPOGRAPHY.fontFamily.secondary, "serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
