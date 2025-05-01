import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-spotifyMix)"],
      },
      colors: {
        spotify: {
          gray: "#1F1F1F",
          lightGray: "#2A2A2A",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
