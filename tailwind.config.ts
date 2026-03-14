import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 9%)",
        foreground: "hsl(240 5% 98%)",
        card: "hsl(240 10% 12%)",
        "card-foreground": "hsl(240 5% 98%)",
        popover: "hsl(240 10% 12%)",
        "popover-foreground": "hsl(240 5% 98%)",
        primary: "hsl(280 60% 70%)",
        "primary-foreground": "hsl(240 5% 98%)",
        secondary: "hsl(240 10% 18%)",
        "secondary-foreground": "hsl(240 5% 98%)",
        muted: "hsl(240 10% 15%)",
        "muted-foreground": "hsl(240 5% 65%)",
        accent: "hsl(240 10% 18%)",
        "accent-foreground": "hsl(240 5% 98%)",
        destructive: "hsl(25 80% 62%)",
        "destructive-foreground": "hsl(240 5% 98%)",
        border: "hsl(240 10% 20%)",
        input: "hsl(240 10% 20%)",
        ring: "hsl(280 60% 70%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
