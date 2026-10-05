import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { brand: { DEFAULT: '#A30D18', dark: '#7A0C12', soft: '#FBEAEC' }, canvas: '#F8F8F6', ink: { primary: '#18202F', secondary: '#344054', muted: '#667085' }, action: { whatsapp: '#16834B', maps: '#1A73E8' } }, fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] } } }, plugins: [] };
export default config;
