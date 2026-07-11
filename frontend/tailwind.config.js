import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#3b82f6",
          "primary-content": "#ffffff",
          secondary: "#4b5563",
          "secondary-content": "#ffffff",
          accent: "#1c1917",
          "accent-content": "#ffffff",
          neutral: "#f3f4f6",
          "neutral-content": "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#e5e7eb",
          "base-content": "#1f2937",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
          fontFamily: "Inter, sans-serif",
        },
      },
      {
        dark: {
          primary: "#3b82f6",
          "primary-content": "#ffffff",
          secondary: "#9ca3af",
          "secondary-content": "#111827",
          accent: "#1c1917",
          "accent-content": "#ffffff",
          neutral: "#27272a",
          "neutral-content": "#e5e7eb",
          "base-100": "#000000",
          "base-200": "#121212",
          "base-300": "#2c2c2c",
          "base-content": "#e5e7eb",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
          fontFamily: "Inter, sans-serif",
        },
      },
    ],
  },
};
