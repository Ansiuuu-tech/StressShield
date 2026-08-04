/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                paper: '#fafafa',
                ink: '#262626',
                muted: '#8a8a8a',
                border: '#e6e6e6',
            },
            fontFamily: {
                display: ['Geist', 'Inter', 'sans-serif'],
                body: ['Geist', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                pill: '999px',
            },
        },
    },
    plugins: [],
};

