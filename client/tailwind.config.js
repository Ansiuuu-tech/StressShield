/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                paper: '#f7f7f5',
                ink: '#171717',
                muted: '#737373',
                border: '#e5e5e2',
                violet: '#7c3aed',
                cyan: '#06b6d4',
                mint: '#10b981',
            },
            fontFamily: {
                display: ['Geist', 'Inter', 'sans-serif'],
                body: ['Geist', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                pill: '999px',
            },
            boxShadow: {
                glow: '0 0 0 1px rgba(255,255,255,.08), 0 24px 80px rgba(0,0,0,.12)',
            },
        },
    },
    plugins: [],
};
