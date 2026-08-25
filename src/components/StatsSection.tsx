import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, Wrench, Cpu, Award, Trophy, Activity, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';
import { LiveSpectrumVisualizer } from './LiveSpectrumVisualizer';

interface StatItem {
  index: string;
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
  accentHex: string;
  tag: string;
  percent: number;
}

export const StatsSection: React.FC = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const revealContainerRef = useScrollReveal(0.1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stats: StatItem[] = [
    {
      index: '01',
      icon: Users,
      value: 1500,
      suffix: '+',
      label: 'Active Student Members',
      description: 'Departmental undergraduate & postgraduate engineers engaged across workshops.',
      color: 'text-lime',
      accentHex: '#00F2FE',
      tag: 'GROWTH +38%',
      percent: 94,
    },
    {
      index: '02',
      icon: Calendar,
      value: 80,
      suffix: '+',
      label: 'Events & Tech Symposia',
      description: 'National hackathons, hardware exhibitions & flagship installations.',
      color: 'text-amber',
      accentHex: '#FFB800',
      tag: 'ANNUAL HIGH',
      percent: 88,
    },
    {
      index: '03',
      icon: Wrench,
      value: 45,
      suffix: '+',
      label: 'Hardware Workshops',
      description: 'Silicon synthesis, PCB impedance routing & microcontroller bootcamps.',
      color: 'text-cyber-purple',
      accentHex: '#8B5CF6',
      tag: 'HANDS-ON LABS',
      percent: 92,
    },
    {
      index: '04',
      icon: Cpu,
      value: 120,
      suffix: '+',
      label: 'Silicon & IoT Prototypes',
      description: 'Autonomous search rovers, LoRaWAN mesh grids & RISC-V edge cores.',
      color: 'text-cyber-emerald',
      accentHex: '#00FF9D',
      tag: 'HARDWARE BUILDS',
      percent: 96,
    },
    {
      index: '05',
      icon: Award,
      value: 30,
      suffix: '+',
      label: 'Industry Mentors',
      description: 'Global semiconductor leads & alumni tech researchers supporting students.',
      color: 'text-cyber-pink',
      accentHex: '#EC4899',
      tag: 'TIER-1 SILICON',
      percent: 85,
    },
    {
      index: '06',
      icon: Trophy,
      value: 12,
      suffix: '+',
      label: 'National Championships',
      description: 'Hackathon 1st prize victories & published Indian Patents.',
      color: 'text-cyber-yellow',
      accentHex: '#FFD60A',
      tag: 'PATENT GRANTED',
      percent: 100,
    },
  ];

  return (
    <section
      id="stats"
      ref={(el) => {
        sectionRef.current = el;
        (revealContainerRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Gradient Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />

      {/* Atmospheric Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-radial from-lime/[0.04] via-cyber-purple/[0.02] to-transparent rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              <Sparkles className="w-3 h-3" />
              <span>01 // DEPARTMENT TELEMETRY & SCALE</span>
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Real-World Metrics &amp;
              <br className="hidden sm:block" />
              Engineering Impact.
            </h2>
          </div>
          <div className="sm:text-right space-y-1 reveal stagger-2">
            <p className="text-xs font-mono text-slate-400 tracking-wider">
              OFFICIAL RECORDS // 2020 – 2026
            </p>
            <p className="text-[10px] font-mono text-lime font-bold tracking-widest uppercase">
              ALL METRICS AUDITED &amp; VERIFIED
            </p>
          </div>
        </div>

        {/* Top Featured Bento Grid Slot: Live Vector CRT Oscilloscope */}
        <div className="mb-8 reveal stagger-1">
          <LiveSpectrumVisualizer />
        </div>

        {/* Cyber Bento Grid for Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((stat, idx) => (
            <CounterCard
              key={stat.index}
              stat={stat}
              inView={inView}
              delay={idx * 60}
              className={`reveal stagger-${(idx % 3) + 1}`}
            />
          ))}
        </div>

        {/* Bottom Hardware Verification Bar */}
        <div className="mt-8 p-4.5 rounded-2xl bg-[#070B16]/90 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3 reveal shadow-md">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-emerald animate-pulse" />
            <span>DATA SOURCE: DEPT OF ELECTRONICS &amp; COMMUNICATION · PIET NAGPUR</span>
          </span>
          <span className="text-lime font-bold flex items-center gap-1.5">
            <span>VERIFIED HARDWARE PROTOCOLS</span>
            <span className="text-cyber-emerald">✓</span>
          </span>
        </div>

      </div>
    </section>
  );
};

const CounterCard: React.FC<{
  stat: StatItem;
  inView: boolean;
  delay: number;
  className?: string;
}> = ({ stat, inView, delay, className }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = stat.value;
    const duration = 1600;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = Math.max(1, Math.ceil(end / totalSteps));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, stat.value]);

  const Icon = stat.icon;

  return (
    <div
      onMouseEnter={() => soundFx.playHover()}
      className={`relative p-7 rounded-3xl bg-[#070C18]/90 border border-white/[0.08] hover:border-white/25 hover:bg-[#0A1226] transition-all duration-400 group overflow-hidden cursor-default shadow-[0_15px_35px_rgba(0,0,0,0.6)] ${className ?? ''}`}
      style={{ 
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Top Hover Glowing Laser Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.accentHex}, transparent)` }}
      />

      {/* HUD Corner Indicators */}
      <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-white/20 group-hover:border-lime transition-colors" />
      <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-white/20 group-hover:border-lime transition-colors" />

      {/* Header Row: Index & Circular Mini Radar / Tag */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-mono text-slate-500 font-bold tracking-widest group-hover:text-white transition-colors">
          // SYS_METRIC.{stat.index}
        </span>
        
        <div className="flex items-center gap-2">
          <span 
            className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider"
            style={{
              backgroundColor: `${stat.accentHex}1A`,
              borderColor: `${stat.accentHex}4D`,
              color: stat.accentHex,
            }}
          >
            {stat.tag}
          </span>
          <div className="p-2 rounded-xl bg-midnight-deep border border-white/10 group-hover:border-white/25 transition-colors">
            <Icon className="w-4 h-4" style={{ color: stat.accentHex }} />
          </div>
        </div>
      </div>

      {/* Big Counter Value with Dynamic Glow */}
      <div className="space-y-2 mb-5">
        <div className="stat-number text-5xl sm:text-6xl text-white flex items-baseline gap-1 leading-none tracking-tight">
          <span>{count.toLocaleString()}</span>
          <span className="text-4xl font-extrabold" style={{ color: stat.accentHex }}>
            {stat.suffix}
          </span>
        </div>
        <h3 className="font-space font-extrabold text-sm sm:text-base text-slate-100 group-hover:text-white transition-colors">
          {stat.label}
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          {stat.description}
        </p>
      </div>

      {/* Radial Progress Gauge Bar */}
      <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>EFFICIENCY INDEX</span>
          <span className="font-bold" style={{ color: stat.accentHex }}>{stat.percent}% NOMINAL</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-midnight-deep overflow-hidden border border-white/5">
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: inView ? `${stat.percent}%` : '0%',
              background: `linear-gradient(90deg, ${stat.accentHex}, #00F2FE)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
