import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import plugin from "tailwindcss/plugin";

// Reemplaza a `withUt` de "uploadthing/tw": ese módulo hace un require.resolve
// dinámico que con Turbopack arrastra todo @uploadthing/* al bundle y rompe el
// build. Son las mismas variantes y el mismo content path, declarados a mano.
const uploadthingPlugin = plugin(({ addVariant }) => {
  addVariant("ut-button", '&>*[data-ut-element="button"]');
  addVariant("ut-allowed-content", '&>*[data-ut-element="allowed-content"]');
  addVariant("ut-label", '&>*[data-ut-element="label"]');
  addVariant("ut-upload-icon", '&>*[data-ut-element="upload-icon"]');
  addVariant("ut-clear-btn", '&>*[data-ut-element="clear-btn"]');
  addVariant("ut-readying", '&[data-state="readying"]');
  addVariant("ut-ready", '&[data-state="ready"]');
  addVariant("ut-uploading", '&[data-state="uploading"]');
});

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@uploadthing/react/dist/**",
  ],
  safelist: [
    "!text-white",
    "bg-[#D8FFC6]",
    "bg-[#20A4F3]/30",
    "bg-[#FFF275]/80",
    "bg-[#FFB238]/80",
    "bg-[#5A0001]/80",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        noto: ["Noto Sans", "sans-serif"],
      },
      colors: {
        fondo: "#FFFDF7",
        pistacho: "#8CD867",
        "text-color": "#031926",
        service: "#F0931A",
        primary: "#EF2D56",
        secondary: "#8CD867",
        "light-text": "#818181",
        petition: "#0091AD",
      },
      borderRadius: {
        "20": "20px",
      },
      screens: {
        "3xl": "1720px",
      },
      transitionProperty: {
        height: "height",
        radius: "border-radius",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            warning: "#F0931A",
          },
        },
      },
    }),
    uploadthingPlugin,
  ],
};
export default config;
