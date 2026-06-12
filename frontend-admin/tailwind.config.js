/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        foreground: "var(--text)",
        muted: "var(--text-muted)",
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "#ffffff",
          dark: "var(--primary-700)"
        },
        accent: "var(--teal)",
        success: "var(--success)",
        warning: "var(--warning)",
        "warning-strong": "var(--warning-strong)",
        danger: "var(--danger)",
        border: "var(--border)",
        sidebar: {
          DEFAULT: "#111628",
          foreground: "#c7d2fe",
          active: "rgba(129, 140, 248, 0.22)"
        }
      },
      boxShadow: {
        card: "var(--shadow)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.125rem"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"]
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite"
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
