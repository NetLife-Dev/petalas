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
                    DEFAULT: "var(--color-primary)",
                    50: "#fff1f2",
                    100: "#ffe4e6",
                    200: "#fecdd3",
                    300: "#fda4af",
                    400: "#fb7185",
                    500: "#f43f5e",
                    600: "#e11d48",
                    700: "#be123c",
                    800: "#9f1239",
                    900: "#881337",
                    950: "#4c0519",
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
                }
            },
            fontFamily: {
                sans: ["var(--font-outfit)", "Inter", "system-ui", "sans-serif"],
                outfit: ["var(--font-outfit)", "Inter", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
            boxShadow: {
                soft: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                medium: "0 4px 6px rgba(0,0,0,0.05), 0 10px 25px rgba(0,0,0,0.06)",
                card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
                shimmer: "shimmer 1.5s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(6px)" },
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
