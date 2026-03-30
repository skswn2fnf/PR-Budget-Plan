import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#2B2D42",
          darkAlt: "#3D3F56",
          pink: "#D63384",
          pinkLight: "#FFF0F6",
          blue: "#1971C2",
          blueLight: "#E7F5FF",
          yellow: "#FFC107",
          yellowBg: "#FFF8E1",
          offWhite: "#F8F9FA",
          lightGray: "#E9ECEF",
          midGray: "#868E96",
          text: "#212529",
          textSub: "#495057",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
