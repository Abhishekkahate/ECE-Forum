import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, Wrench, Cpu, Award, Trophy, Activity, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';

interface StatItem {
  index: string;
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  tag: string;
  percent: number;
  accent: 'signal' | 'cyan' | 'violet';
}

export const StatsSection: React.FC = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const revealRef = useScrollReveal(0.08);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.12 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const stats: StatItem[] = [
    { index: '01', icon: Users, value: 1500, suffix: '+', label: 'Active Members', tag: '+38% YoY', percent: 94, accent: 'signal' },
    { index: '02', icon: Calendar, value: 80, suffix: '+', label: 'Events & Symposia', tag: 'Annual high', percent: 88, accent: 'cyan' },
    { index: '03', icon: Wrench, value: 45, suffix: '+', label: 'Hardware Workshops', tag: 'Hands-on', percent: 92, accent: 'violet' },
    { index: '04', icon: Cpu, value: 120, suffix: '+', label: 'Prototypes Shipped', tag: 'Lab to field', percent: 96, accent: 'signal' },
    { index: '05', icon: Award, value: 30, suffix: '+', label: 'Industry Mentors', tag: 'Tier-1 silicon', percent: 85, accent: 'cyan' },
    { index: '06', icon: Trophy, value: 12, suffix: '+', label: 'National Victories', tag: 'Patented', percent: 100, accent: 'violet' },
  ];

  return (
    <section
      id="stats"
      ref={(el) => { sectionRef.current = el; (revealRef as React.MutableRefObject<HTMLElement | null>).current = el; }}
      className="relative bg-[#08080A] text-[#F5F3EF] overflow-hidden border-y border-white/[0.06]"
    >
      <div className="absolute inset-0 editorial-grid opacity-[0.04] pointer-events-none" />
      <div className="hidden xl:flex absolute left-0 top-0 bottom-0 w-[56px] border-r border-white/[0.06] bg-[rgba(10,10,12,0.35)] flex-col items-center py-6">
        <span className="text-[10px] font-mono tracking-[0.22em] text-white/25 [writing-mode:vertical-rl] rotate-180">TELEMETRY — CH 02</span>
        <span className="mt-4 w-px h-16 bg-gradient-to-b from-[#FF4A15]/40 to-transparent" />
      </div>

      <div className="relative xl:pl-[56px]">
        {/* Header as calibration bar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-10 lg:pt-14 pb-6 lg:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 border border-white/[0.08] rounded-full bg-white/[0.04] pl-1 pr-3 py-1 text-[11px] font-mono tracking-[0.14em] text-white/60">
                <span className="w-6 h-6 rounded-full bg-[#FF4A15] text-white grid place-items-center"><Activity className="w-3 h-3" /></span>
                02 — TELEMETRY <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10 text-[#FF4A15]"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse" /> LIVE AUDIT</span>
              </div>
              <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.045em] leading-[0.9] text-[38px] sm:text-[48px] lg:text-[54px]">Scale that <span className="font-['Instrument_Serif'] italic font-normal text-[#FF4A15]">ships.</span></h2>
              <div className="mt-3 h-px w-[280px] bg-gradient-to-r from-[#FF4A15]/50 via-white/10 to-transparent" />
            </div>
            <div className="reveal stagger-2 max-w-[380px] border-l-2 border-white/[0.06] pl-4">
              <p className="text-[13px] leading-relaxed text-white/45">Audited dept telemetry · 2020—2026 · labs, chapters &amp; career milestones.</p>
              <p className="mt-1 text-[10px] font-mono tracking-[0.14em] text-white/25">CALIBRATED · VERIFIED · SIGNAL-LOCKED</p>
            </div>
          </div>
        </div>

        {/* RULER — horizontal calibration strip — NOT cards */}
        <div className="border-y border-white/[0.06] bg-[rgba(15,15,17,0.85)] backdrop-blur-xl overflow-x-auto hide-scrollbar">
          <div className="flex min-w-[1080px] divide-x divide-white/[0.06]">
            {stats.map((s, idx) => (
              <RulerStat key={s.index} stat={s} inView={inView} delay={idx * 80} />
            ))}
          </div>
        </div>
        {/* mobile fallback — same ruler scrolls horizontally */}

        {/* footer strip */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-[0.12em] text-white/30">
          <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF4A15] animate-pulse shadow-[0_0_8px_rgba(255,74,21,0.5)]" /> DATA SOURCE — DEPT OF ECE · PIET NAGPUR — 2026—27</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-white/50"><ShieldCheck className="w-3.5 h-3.5 text-[#FF4A15]" /> AUDITED & VERIFIED</span>
        </div>
      </div>
    </section>
  );
};

const RulerStat: React.FC<{ stat: StatItem; inView: boolean; delay: number }> = ({ stat, inView, delay }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const inc = Math.max(1, Math.ceil(stat.value / 75));
    const t = setInterval(() => {
      v += inc;
      if (v >= stat.value) { setCount(stat.value); clearInterval(t); } else setCount(v);
    }, 16);
    return () => clearInterval(t);
  }, [inView, stat.value]);
  const Icon = stat.icon;
  const accent = stat.accent === 'signal' ? '#FF4A15' : stat.accent === 'cyan' ? '#00E5CC' : '#7A5CFF';
  return (
    <div className="flex-1 min-w-[180px] px-5 lg:px-6 py-6 lg:py-8 relative group hover:bg-white/[0.02] transition-colors">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-mono tracking-[0.16em] text-white/25">0{stat.index}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.08em] px-2 py-0.5 rounded-full border text-[11px] font-bold" style={{ background: `${accent}14`, borderColor: `${accent}28`, color: accent }}>
          <span className="w-1 h-1 rounded-full" style={{ background: accent }} /> {stat.tag}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="font-[Syne] font-[800] tracking-[-0.05em] leading-none text-[42px] lg:text-[44px] text-[#F5F3EF]">{count.toLocaleString()}<span style={{ color: accent }} className="ml-0.5">{stat.suffix}</span></div>
        <span className="mb-1.5 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.07] grid place-items-center text-white/50 group-hover:bg-[#FF4A15] group-hover:text-white group-hover:border-[#FF4A15] transition-colors shrink-0"><Icon className="w-4 h-4" /></span>
      </div>
      <div className="mt-3 text-[12.5px] font-bold leading-none tracking-[-0.01em] text-[#F5F3EF]">{stat.label}</div>
      {/* ruler tick */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono tracking-[0.12em] text-white/30"><span>TICKS</span><span style={{ color: accent }}>{stat.percent}%</span></div>
        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 flex gap-[6px] items-center px-0.5 opacity-30">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className={`w-px h-1.5 bg-white/40 ${i % 5 === 0 ? 'h-2.5 bg-white/60' : ''}`} />
            ))}
          </div>
          <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: inView ? `${stat.percent}%` : '0%', background: accent, boxShadow: `0 0 8px ${accent}60` }} />
        </div>
      </div>
    </div>
  );
};
