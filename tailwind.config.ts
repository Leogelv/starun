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
                'inter': ['Inter', 'sans-serif'],
                'unbounded': ['Unbounded', 'sans-serif'],
            },
            colors: {
                primary: "#9333ea",
                secondary: "#a855f7",
                purple: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7c2d8a',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },
                dark: {
                    bg: '#0A0818',
                    surface: '#110e1f',
                    'surface-light': '#1a1630',
                }
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
                'gradient-accent': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                'gradient-dark': 'linear-gradient(180deg, #0A0818 0%, #1a1630 100%)',
                'gradient-glow': 'radial-gradient(ellipse at top, #3b0764 0%, transparent 50%)',
            },
            boxShadow: {
                'glow': '0 0 40px rgba(147, 51, 234, 0.3)',
                'glow-sm': '0 0 20px rgba(147, 51, 234, 0.3)',
                'glow-lg': '0 0 60px rgba(147, 51, 234, 0.4)',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            }
        },
    },
    plugins: [],
}

export default config
