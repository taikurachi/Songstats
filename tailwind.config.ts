import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "5xl":
          "0 25px 30px -12px rgba(0, 0, 0, 0.2), 0 40px 40px -15px rgba(0, 0, 0, 0.18), 0 30px 70px 5px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-spotifyMix)"],
      },
      colors: {
        spotify: {
          darkGray: "#121212",
          gray: "#1F1F1F",
          lightGray: "#2A2A2A",
          extraLightGray: "#A5A5A5",
          green: "#1CD760",
        },
      },
      scale: {
        "102": "1.02",
      },
    },
  },
  plugins: [],
} satisfies Config;
