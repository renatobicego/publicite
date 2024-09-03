import type { Config } from "tailwindcss";
import {nextui} from "@nextui-org/react";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"

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
        lato: ["Lato", "sans-serif"],
      },
      colors: {
        fondo: "#FFFDF7",
        pistacho: "#8CD867",
        'text-color': '#031926',
        service: "#F0931A",
        primary: "#EF2D56",
        secondary: "#8CD867",
        'light-text': "#818181",
        petition: "#0091AD"
      },
      borderRadius: {
        "20": "20px"
      },
      screens: {
        '3xl': '1720px'
      },
      transitionProperty: {
        'height': 'height',
        'radius': 'border-radius'
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()]
};
export default config;
