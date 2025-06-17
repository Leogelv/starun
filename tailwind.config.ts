import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{ts,tsx,js,jsx,mdx}', // если у тебя всё в /src
        './app/**/*.{ts,tsx,js,jsx,mdx}',
        './components/**/*.{ts,tsx,js,jsx,mdx}',
        './fsd/**/*.{ts,tsx,js,jsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                montserrat: ['var(--font-montserrat)', 'sans-serif'],
            },
            colors: {
                primary: "#48494F",
                secondary: "#8C8C8C",
            }
        },
    },
    plugins: [],
}

export default config
