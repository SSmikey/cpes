import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                prompt: ["var(--font-prompt)", "sans-serif"],
                kanit: ["var(--font-kanit)", "sans-serif"],
                inter: ["var(--font-inter)", "sans-serif"],
                sarabun: ["var(--font-sarabun)", "sans-serif"],
            },
        },
    },
};

export default config;
