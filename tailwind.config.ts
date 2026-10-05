import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { brand: { DEFAULT: '#6D0808', dark: '#4F0505', soft: '#EEEAD7' }, canvas: '#FBFAF4', ink: { primary: '#261B19', secondary: '#655955', muted: '#8A7F79' } }, fontFamily: { sans: ['DM Sans', 'Arial', 'sans-serif'] } } }, plugins: [] };
export default config;
