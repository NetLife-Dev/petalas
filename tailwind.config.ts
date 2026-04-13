import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#B05070",
                    50: "#fdf2f5",
                    100: "#fbe6ec",
                    200: "#f5c8d6",
                    300: "#eda0b8",
                    400: "#e07090",
                    500: "#c85878",
                    600: "#B05070",
                    700: "#8B3A55",
                    800: "#6e2d42",
                    900: "#5a2438",
                    950: "#2d0f1e",
                },
                secondary: {
                    DEFAULT: "#6B7C45",
                    light: "#8a9e5a",
                    dark: "#4e5c32",
                },
                surface: {
                    DEFAULT: "var(--color-bg-surface)",
                    50: "var(--surface-50)",
                    100: "var(--surface-100)",
                    200: "var(--surface-200)",
                    300: "var(--surface-300)",
                    muted: "var(--color-text-tertiary)",
                },
                text: {
                    primary: "var(--color-text-main)",
                    secondary: "var(--color-text-secondary)",
                    muted: "var(--color-text-muted)",
                    tertiary: "var(--color-text-tertiary)",
                    inverted: "#FFFFFF",
                },
            },
            fontFamily: {
                display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
                sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
            boxShadow: {
                soft: "0 2px 8px rgba(176, 80, 112, 0.08)",
                medium: "0 4px 16px rgba(176, 80, 112, 0.12)",
                card: "0 8px 32px rgba(176, 80, 112, 0.10)",
                "card-hover": "0 12px 40px rgba(176, 80, 112, 0.18)",
                glow: "0 0 20px rgba(176, 80, 112, 0.25)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "fade-bloom": "fadeBloom 0.35s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
                shimmer: "shimmer 1.5s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeBloom: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.96)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
