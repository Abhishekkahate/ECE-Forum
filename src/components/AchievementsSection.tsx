import React, { useState } from 'react';
import { Trophy, Award, FileCheck2, Briefcase, ExternalLink, Star, X, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

interface AchievementItem {
  index: string;
  type: string;
  title: string;
  team: string;
  desc: string;
  metric: string;
  icon: React.ElementType;
  color: string;
  borderHover: string;
}

export const AchievementsSection: React.FC = () => {
  const [selectedPatent, setSelectedPatent] = useState(false);
  const revealRef = useScrollReveal(0.08);

  const achievements: AchievementItem[] = [
    {
      index: '01',
      type: 'NATIONAL HACKATHON CHAMPION',
      title: '1st Prize — National Smart Hardware Expo',
      team: 'Autonomous Rover Wing',
      desc: 'Autonomous LiDAR search & rescue rover powered by RISC-V SoC won 1st prize among 120+ colleges.',
      metric: '₹1,00,000 Prize',
      icon: Trophy,
      color: 'text-amber',
      borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(255,184,0,0.25)]',
    },
    {
      index: '02',
      type: 'INDIAN PATENT GRANTED',
      title: 'Govt Patent: Low-Power Edge IoT Mesh',
      team: 'ECE Research Cell',
      desc: 'Indian patent granted for an ultra-low power LoRaWAN mesh communication node.',
      metric: 'Patent No. 492026/IN',
      icon: FileCheck2,
      color: 'text-lime',
      borderHover: 'hover:border-lime/60 hover:shadow-[0_0_30px_rgba(0,242,254,0.25)]',
    },
    {
      index: '03',
      type: 'INSTITUTIONAL HONOUR',
      title: 'Outstanding Student Chapter Award',
      team: 'Executive Council',
      desc: 'IEEE & IETE regional excellence award for hosting 45+ workshops and student research publications.',
      metric: 'Top 1% Chapter',
      icon: Award,
      color: 'text-cyber-purple',
      borderHover: 'hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    },
    {
      index: '04',
      type: 'SEMICONDUCTOR PLACEMENTS',
      title: 'Tier-1 Silicon Placements & Internships',
      team: 'Department Placement Cell',
      desc: 'Student leaders placed across Texas Instruments, Qualcomm, Intel, Cadence, and Synopsys.',
      metric: '24 LPA Peak',
      icon: Briefcase,
      color: 'text-cyber-emerald',
      borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(0,255,157,0.25)]',
    },
  ];

  return (
    <section
      id="achievements"
      ref={revealRef}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Gradient Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />

      {/* Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-radial from-amber/[0.03] to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              04 // PRESTIGE &amp; ACHIEVEMENTS
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Verified Engineering
              <br className="hidden sm:block" />
              Victories &amp; Honours.
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            Extraordinary student breakthroughs in competitions, patents, and silicon careers.
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((item, idx) => {
            const Icon = item.icon;
            const isPatent = item.index === '02';

            return (
              <div
                key={item.index}
                onClick={() => {
                  if (isPatent) {
                    soundFx.playLaser();
                    setSelectedPatent(true);
                  } else {
                    soundFx.playClick();
                  }
                }}
                onMouseEnter={() => soundFx.playHover()}
                className={`reveal stagger-${idx + 1} group relative p-8 bg-[#070C1A] border border-white/10 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-500 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${item.borderHover} ${isPatent ? 'cursor-pointer' : ''}`}
              >
                {/* Background Watermark Index */}
                <div className="absolute bottom-2 right-6 text-[90px] font-space font-extrabold text-white/[0.02] select-none leading-none pointer-events-none group-hover:text-white/[0.04] transition-colors">
                  {item.index}
                </div>

                <div className="space-y-5 relative z-10">
                  {/* Top row: Type badge + Gold Metric Pill */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[9px] font-mono font-extrabold uppercase border border-white/15 px-3 py-1 rounded-xl bg-midnight-deep text-slate-300 tracking-widest shadow-sm">
                      {item.type}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-white font-extrabold bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                      <Star className="w-3.5 h-3.5 text-amber fill-current" />
                      {item.metric}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-midnight-deep border border-white/15 shrink-0 group-hover:border-white/30 transition-colors shadow-inner">
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-space font-extrabold text-xl text-white leading-snug group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-lime tracking-wide">{item.team}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans font-normal">{item.desc}</p>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-emerald shadow-[0_0_8px_#00FF9D]" />
                    <span className="tracking-wider">VERIFIED DEPARTMENT MILESTONE</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Patent Verification Modal */}
      {selectedPatent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#080D1A] border-2 border-lime/50 p-8 shadow-[0_0_60px_rgba(0,242,254,0.3)] space-y-6 text-left">
            <button
              onClick={() => setSelectedPatent(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-midnight-deep border border-white/15 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-lime text-xs font-mono font-bold tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>OFFICIAL PATENT RECORD</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-space font-extrabold text-2xl text-white">
                Indian Patent Granted
              </h3>
              <span className="inline-block font-mono text-xs text-amber font-bold bg-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-lg">
                PATENT NO. 492026/IN
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300 bg-midnight-deep p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Title:</span>
                <span className="font-bold text-white text-right">Low-Power Edge IoT Mesh</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Inventors:</span>
                <span className="font-bold text-lime text-right">ECE Research &amp; Prototyping Cell</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jurisdiction:</span>
                <span className="font-bold text-white">Govt of India Patent Office</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatent(false)}
              className="w-full py-3 rounded-2xl bg-white text-midnight font-space font-extrabold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close Verification Record
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
