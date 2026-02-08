import type { Config } from "tailwindcss";
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from "@shalkaar/shared-types";

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
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
      },
      spacing: {
        xs: SPACING.xs,
        sm: SPACING.sm,
        md: SPACING.md,
        lg: SPACING.lg,
        xl: SPACING.xl,
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
