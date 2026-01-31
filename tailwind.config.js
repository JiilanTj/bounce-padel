import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--landing-page-primary) / <alpha-value>)',
                'background-light': 'rgb(var(--landing-page-background-light) / <alpha-value>)',
                'background-dark': 'rgb(var(--landing-page-background-dark) / <alpha-value>)',
                'surface-dark': 'rgb(var(--landing-page-surface-dark) / <alpha-value>)',
                'text-dim': 'rgb(var(--landing-page-text-dim) / <alpha-value>)',
                'landing-border': 'rgb(var(--landing-page-border) / <alpha-value>)',
                'landing-footer-bg': 'rgb(var(--landing-page-footer-bg) / <alpha-value>)',
                'landing-shop-gradient': 'rgb(var(--landing-page-shop-gradient) / <alpha-value>)',
                'landing-shop-card-bg': 'rgb(var(--landing-page-shop-card-bg) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Manrope', 'sans-serif'],
                body: ['Manrope', 'sans-serif'],
            },
        },
    },

    plugins: [forms],
};
