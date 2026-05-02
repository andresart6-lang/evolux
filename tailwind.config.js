/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        background: 'var(--bg-body)',
        surface: 'var(--bg-surface)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'acid': 'var(--primary)',
        'forest': 'var(--secondary)',
        text: {
          main: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
