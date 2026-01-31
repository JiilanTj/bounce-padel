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

    darkMode: "class", // Enabled to match HTML's dark mode class on html tag
    theme: {
        extend: {
            colors: {
                "primary": "#0fbd49",
                "background-light": "#f6f8f6",
                "background-dark": "#112217",
                "surface-dark": "#1a3324",
                "text-dim": "#92c9a4",
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ["Manrope", "sans-serif"],
                body: ["Manrope", "sans-serif"],
            },
        },
    },

    plugins: [forms],
};
