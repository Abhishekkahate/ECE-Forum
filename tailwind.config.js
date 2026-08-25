/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    screens: { 'xs': '380px', 'sm': '640px', 'md': '768px', 'lg': '1024px', 'xl': '1280px', '2xl': '1536px' },
    extend: {
      fontFamily: { display: ['Syne','sans-serif'], sans: ['Space Grotesk','sans-serif'], mono: ['JetBrains Mono','monospace'], space: ['"Space Grotesk"','sans-serif'], sora: ['Sora','sans-serif'] },
      colors: {
        lime: '#CCFF00', violet: '#7000FF', cyan: '#00D9FF', amber: '#FFB800', midnight: { DEFAULT: '#08080A', lighter: '#080C16', card: 'rgba(9, 14, 26, 0.78)', deep: '#020306', border: 'rgba(255, 255, 255, 0.08)', glow: '#0B132B' },
        navy: { deep: '#060A14', dark: '#0C1322', card: '#111A30' },
        cyber: { cyan: '#00F2FE', blue: '#0072FF', amber: '#FFB800', yellow: '#FFD60A', purple: '#8B5CF6', violet: '#A855F7', pink: '#EC4899', green: '#10B981', emerald: '#00FF9D', red: '#EF4444' },
        neon: { yellow: '#FFD60A', cyan: '#00F2FE', blue: '#3B82F6', purple: '#A855F7', pink: '#EC4899', green: '#10B981', emerald: '#00FF9D' }
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -4px rgba(0, 242, 254, 0.5)',
        'neon-amber': '0 0 25px -4px rgba(255, 184, 0, 0.5)',
        'glow-cyan': '0 0 40px -10px rgba(0, 242, 254, 0.6)',
        'tech-panel': '0 20px 50px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'card-hover': '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -8px rgba(0, 242, 254, 0.25)',
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 14s linear infinite',
        'marquee-reverse': 'marqueeReverse 30s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 25s linear infinite',
        'scan-line': 'scanLine 3.5s ease-in-out infinite',
        'border-pulse': 'borderPulse 3s ease-in-out infinite',
        reveal: 'reveal 0.8s cubic-bezier(0.76,0,0.24,1) forwards',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        marqueeReverse: { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0%)' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-14px)' } },
        floatSlow: { '0%,100%': { transform: 'translateY(0px) rotate(0deg)' }, '50%': { transform: 'translateY(-14px) rotate(1deg)' } },
        pulseGlow: { '0%,100%': { opacity: '0.4', transform: 'scale(1)' }, '50%': { opacity: '0.9', transform: 'scale(1.05)' } },
        scanLine: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(1000%)' } },
        borderPulse: { '0%,100%': { borderColor: 'rgba(0, 242, 254, 0.2)' }, '50%': { borderColor: 'rgba(0, 242, 254, 0.6)', boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        reveal: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}