import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Fonts ──────────────────────────────────────────────────────────────
      fontFamily: {
        serif: ['var(--serif)', 'Georgia', 'serif'],
        sans: ['var(--sans)', '-apple-system', 'sans-serif'],
      },

      // ── Colors ─────────────────────────────────────────────────────────────
      colors: {
        gold: {
          DEFAULT: '#B8922A',
          2: '#8A6A10',
          3: '#D4A840',
          4: '#E8D898',
          soft: '#F5EDD6',
        },
        ink: {
          DEFAULT: '#14120D',
          2: '#3A3628',
          3: '#7A7060',
          4: '#B0A898',
        },
        bg: {
          DEFAULT: '#FBF9F5',
          2: '#F6F2EA',
          3: '#EEE7DA',
          4: '#E3D9C4',
          dark: '#14120D',
          dark2: '#1C1A14',
        },
      },

      // ── Keyframes ──────────────────────────────────────────────────────────
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        orbFloat: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(40px, -40px) scale(1.1)' },
        },
        rotateDiamond: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scrollDot: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(250%)' },
        },
        sparkDot: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.6)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        shimmer: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
      },

      // ── Animations ─────────────────────────────────────────────────────────
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'orb-float': 'orbFloat 12s ease-in-out infinite alternate',
        'orb-float-slow': 'orbFloat 10s ease-in-out infinite alternate',
        'rotate-diamond': 'rotateDiamond 3s linear infinite',
        'fade-up': 'fadeUp 1.2s ease forwards',
        'scroll-dot': 'scrollDot 2s ease-in-out infinite',
        'spark-dot': 'sparkDot 3s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },

      // ── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 3px rgba(20,18,13,0.06)',
        DEFAULT: '0 8px 30px rgba(20,18,13,0.08)',
        lg: '0 24px 60px rgba(20,18,13,0.12)',
        gold: '0 12px 40px rgba(184,146,42,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
