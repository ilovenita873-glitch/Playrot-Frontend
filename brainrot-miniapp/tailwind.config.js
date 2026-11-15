/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        raise: 'rgb(var(--raise) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        good: 'rgb(var(--good) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        sheet: { from: { transform: 'translateY(40px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } },
      },
      animation: {
        pop: 'pop .45s cubic-bezier(.2,.9,.3,1.2) both',
        sheet: 'sheet .25s ease-out both',
        marquee: 'marquee 40s linear infinite',
        shake: 'shake .3s linear 2',
      },
    },
  },
  plugins: [],
};
