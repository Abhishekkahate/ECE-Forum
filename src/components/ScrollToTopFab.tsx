import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ScrollToTopFab: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;
  const size = 48;
  const stroke = 2.5;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <button
      onClick={() => {
        soundFx.playLaser();
        if ((window as any).__lenis) {
          (window as any).__lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
      aria-label="Back to top"
      className="fixed z-40 w-12 h-12 rounded-full bg-[rgba(12,12,14,0.88)] backdrop-blur-2xl border border-white/[0.10] text-[#F5F3EF] grid place-items-center shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#FF4A15]/40 hover:bg-[#FF4A15] hover:text-white hover:shadow-[0_0_30px_rgba(255,74,21,0.45),0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group max-lg:hidden"
      style={{ bottom: 'max(20px, env(safe-area-inset-bottom))', right: 'max(20px, env(safe-area-inset-right))' }}
    >
      {/* circular progress — signal stroke */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth={stroke} />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#FF4A15"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.12s linear', filter: 'drop-shadow(0 0 6px rgba(255,74,21,0.55))' }}
        />
      </svg>
      {/* inner dot */}
      <span className="absolute w-1.5 h-1.5 rounded-full bg-[#FF4A15] top-1.5 left-1/2 -translate-x-1/2 opacity-60 group-hover:bg-white transition-colors" />
      <ArrowUp className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform duration-300" />
    </button>
  );
};
