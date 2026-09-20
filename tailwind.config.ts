import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive))",
          foreground: "hsl(var(--color-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
      },
      spacing: {
        base: "var(--spacing-base)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        gutter: "var(--spacing-gutter)",
        margin: "var(--spacing-margin)",
      },
      fontSize: {
        h1: ["var(--text-h1)", { lineHeight: "var(--text-h1-line-height)", letterSpacing: "var(--text-h1-letter-spacing)", fontWeight: "var(--text-h1-weight)" }],
        "body-md": ["var(--text-body-md)", { lineHeight: "var(--text-body-md-line-height)", fontWeight: "var(--text-body-md-weight)" }],
        "label-caps": ["var(--text-label-caps)", { lineHeight: "var(--text-label-caps-line-height)", letterSpacing: "var(--text-label-caps-letter-spacing)", fontWeight: "var(--text-label-caps-weight)" }],
      },
    },
  },
  plugins: [],
};

export default config;