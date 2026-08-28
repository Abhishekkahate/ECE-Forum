/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    screens: { 'xs': '380px', 'sm': '640px', 'md': '768px', 'lg': '1024px', 'xl': '1280px', '2xl': '1536px' },
    extend: {
      fontFamily: {
        display: ['Syne','Space Grotesk','sans-serif'],
        sans: ['Space Grotesk','Geist','system-ui','sans-serif'],
        mono: ['JetBrains Mono','Geist Mono','monospace'],
        space: ['"Space Grotesk"','sans-serif'],
        serif: ['Instrument Serif','serif'],
      },
      colors: {
        // Atelier No.8 — Signal Orange system
        signal: { DEFAULT: '#FF4A15', soft: 'rgba(255,74,21,0.12)', glow: 'rgba(255,74,21,0.45)', dark: '#CC3A0F' },
        ink: { DEFAULT: '#F5F3EF', muted: '#A8ADB3', faint: '#6E7378', line: 'rgba(245,243,239,0.08)' },
        obsidian: { DEFAULT: '#08080A', surface: '#0F0F11', elevated: '#17171B', soft: '#1C1C20', border: 'rgba(245,243,239,0.08)' },
        // legacy + accents kept for pages not redesigned
        lime: { DEFAULT: '#FF4A15', light: '#FF6B3A', glow: 'rgba(255,74,21,0.4)' },
        cyan: { DEFAULT: '#00E5CC', glow: 'rgba(0,229,204,0.35)' },
        violet: { DEFAULT: '#7A5CFF', glow: 'rgba(122,92,255,0.35)' },
        amber: { DEFAULT: '#FFD60A', glow: 'rgba(255,214,10,0.35)' },
        emerald: { DEFAULT: '#10B981' },
        midnight: { DEFAULT: '#08080A', lighter: '#0F0F11', card: 'rgba(16,16,18,0.72)', deep: '#050507', border: 'rgba(245,243,239,0.08)' },
        navy: { deep: '#06080F', dark: '#0C101C', card: '#111827' },
        cyber: { cyan: '#00E5CC', blue: '#0072FF', amber: '#FFD60A', purple: '#7A5CFF' },
      },
      boxShadow: {
        'glass-sm': '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
        'glass-md': '0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 16px 42px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-xl': '0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
        'signal': '0 0 30px rgba(255,74,21,0.35), 0 0 60px rgba(255,74,21,0.15)',
        'signal-lg': '0 10px 30px -8px rgba(255,74,21,0.45)',
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 14s linear infinite',
        'marquee-reverse': 'marqueeReverse 30s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        shimmer: 'shimmer 2.2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 26s linear infinite',
        'signal-pulse': 'signalPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        marqueeReverse: { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        floatSlow: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-8px) rotate(0.6deg)' } },
        pulseGlow: { '0%,100%': { opacity: '0.45', transform: 'scale(1)' }, '50%': { opacity: '0.85', transform: 'scale(1.04)' } },
        signalPulse: { '0%,100%': { boxShadow: '0 0 0 0 rgba(255,74,21,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,74,21,0)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      backdropBlur: { xs: '2px', '2xl': '24px', '3xl': '40px' },
    },
  },
  plugins: [],
}
