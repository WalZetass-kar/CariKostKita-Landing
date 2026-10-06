import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F2',
          100: '#FDE8E8',
          200: '#FBD5D5',
          600: '#8C0B0B',
          DEFAULT: '#6D0808',
          dark: '#4F0505',
          soft: '#EEEAD7',
          accent: '#A30D18',
        },
        cream: {
          DEFAULT: '#EEEADA',
          light: '#F8F5EB',
          dark: '#E2DDCB',
        },
        canvas: '#FBFAF4',
        ink: {
          primary: '#261B19',
          secondary: '#655955',
          muted: '#8A7F79',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'Arial', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite reverse',
        'pulse-subtle': 'pulseGlow 2.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
      },
      boxShadow: {
        'phone-3d': '0 25px 50px -12px rgba(15, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'card-soft': '0 8px 30px rgba(89, 62, 42, 0.08)',
        'button-primary': '0 8px 20px rgba(109, 8, 8, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
