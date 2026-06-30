/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── ALURA Brand ──────────────────────────────────────────
        // Primary: Gold #FDD200  |  Dark base: #000000
        // ─────────────────────────────────────────────────────────

        // Core brand tokens
        "primary":                      "#000000",        // black — main CTA bg
        "on-primary":                   "#FDD200",        // gold text on black
        "primary-container":            "#1a1600",        // near-black w/ warm tint
        "on-primary-container":         "#FDD200",        // gold text on dark container
        "primary-fixed":                "#FDD200",        // gold chip / tag bg
        "primary-fixed-dim":            "#e6be00",        // slightly darker gold
        "on-primary-fixed":             "#000000",        // black text on gold
        "on-primary-fixed-variant":     "#1a1600",        // very dark on dim gold

        // Secondary: warm charcoal
        "secondary":                    "#3d3a00",        // dark warm brown-black
        "on-secondary":                 "#FDD200",        // gold on secondary
        "secondary-container":          "#FFF8CC",        // pale gold tint
        "on-secondary-container":       "#1a1600",        // dark text on pale gold
        "secondary-fixed":              "#FFF8CC",
        "secondary-fixed-dim":          "#f5e87a",
        "on-secondary-fixed":           "#1a1600",
        "on-secondary-fixed-variant":   "#3d3a00",

        // Tertiary: accent gold-green
        "tertiary":                     "#5c5200",        // dark olive-gold
        "on-tertiary":                  "#ffffff",
        "tertiary-container":           "#FFF3B0",        // very pale gold
        "on-tertiary-container":        "#1a1600",
        "tertiary-fixed":               "#FDD200",
        "tertiary-fixed-dim":           "#e6be00",
        "on-tertiary-fixed":            "#000000",
        "on-tertiary-fixed-variant":    "#3d3a00",

        // Surfaces — warm off-white base (light theme)
        "background":                   "#FFFDF0",        // very warm white
        "on-background":                "#1a1600",        // near-black warm
        "surface":                      "#FFFDF0",
        "surface-bright":               "#ffffff",
        "surface-dim":                  "#e8e5d4",
        "surface-variant":              "#F5F0D8",        // warm cream
        "surface-container-lowest":     "#ffffff",
        "surface-container-low":        "#FAF7E8",        // warm light cream
        "surface-container":            "#F5F0D8",        // cream
        "surface-container-high":       "#EDE9CF",        // slightly darker cream
        "surface-container-highest":    "#E5E0C4",        // warm gray-cream

        // On-surface
        "on-surface":                   "#1a1600",        // warm near-black
        "on-surface-variant":           "#4d4900",        // dark warm gold-gray
        "surface-tint":                 "#FDD200",        // gold tint

        // Outline
        "outline":                      "#7a7200",        // warm dark gold
        "outline-variant":              "#ccc799",        // warm gold-cream border

        // Inverse
        "inverse-surface":              "#000000",        // black inverse bg
        "inverse-on-surface":           "#FDD200",        // gold on black
        "inverse-primary":              "#FDD200",        // gold inverse primary

        // Error
        "error":                        "#ba1a1a",
        "on-error":                     "#ffffff",
        "error-container":              "#ffdad6",
        "on-error-container":           "#93000a",

        // Status
        "status-error":                 "#EF4444",
        "status-success":               "#10B981",
        "status-info":                  "#3B82F6",
        "status-warning":               "#F59E0B",

        // Risk
        "risk-high":                    "#7F1D1D",
        "risk-medium":                  "#B45309",
        "risk-low":                     "#065F46",

        // Brand accent shortcuts
        "gold":                         "#FDD200",
        "gold-dark":                    "#e6be00",
        "gold-light":                   "#FFF8CC",
        "brand-black":                  "#000000",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px",
      },
      spacing: {
        "gutter-desktop": "24px",
        "gutter-mobile": "16px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "container-max": "1280px",
        "base": "4px",
      },
      fontFamily: {
        headline: ["Hanken Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
}
