import React, { useState, useEffect } from 'react';
import { ArrowUp, Calendar } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ScrollToTopFab: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
        setIsVisible(window.scrollY > 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    soundFx.playLaser();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToEvents = () => {
    soundFx.playClick();
    const el = document.getElementById('events');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Quick Jump to Events Button */}
      <button
        onClick={scrollToEvents}
        title="Jump to Event Calendar & Tickets"
        id="fab-quick-events-btn"
        className="p-2.5 rounded-full bg-midnight-deep/90 border border-amber/40 text-amber hover:bg-amber/20 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,184,0,0.25)] backdrop-blur-xl cursor-pointer group"
      >
        <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Ascend to Top with Circular SVG Progress Ring */}
      <button
        onClick={scrollToTop}
        title={`Scroll to Top (${Math.round(scrollProgress)}%)`}
        id="fab-scroll-top-btn"
        className="relative w-12 h-12 rounded-full bg-midnight-deep/90 border border-white/15 text-slate-300 hover:text-lime hover:border-lime/50 hover:scale-110 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-center cursor-pointer group"
      >
        {/* SVG Progress Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-white/10"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-lime transition-all duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
      </button>

    </div>
  );
};
