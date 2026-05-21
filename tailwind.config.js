/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ─── Slate (default Tailwind + tonos intermedios) ──────
        slate: {
          50:  '#f8fafc',
          55:  '#f5f8fb',
          100: '#f1f5f9',
          200: '#e2e8f0',
          205: '#dde4ee',
          250: '#d6dde6',
          300: '#cbd5e1',
          350: '#afbbcc',
          400: '#94a3b8',
          405: '#90a0b6',
          450: '#7c8aa1',
          500: '#64748b',
          550: '#556277',
          600: '#475569',
          650: '#3e4a62',
          700: '#334155',
          750: '#283447',
          800: '#1e293b',
          805: '#1c2739',
          850: '#172033',
          855: '#161e30',
          900: '#0f172a',
          950: '#020617',
        },
        // ─── Brand (verde corporativo Garnier) ─────────────────
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          650: '#048360',
          700: '#047857',
          800: '#065f46',
          850: '#055232',
          900: '#064e3b',
          950: '#022c22',
        },
        // ─── Rose intermedios usados en el código ──────────────
        rose: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          450: '#f76172',
          500: '#f43f5e',
          600: '#e11d48',
          650: '#d01949',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
      },
      spacing: {
        '4.5': '1.125rem',
      },
      width: {
        '4.5': '1.125rem',
      },
      height: {
        '4.5': '1.125rem',
      },
      padding: {
        '4.5': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out both',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
