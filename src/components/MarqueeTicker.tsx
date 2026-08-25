import React from 'react';
import { Trophy, Radio, Cpu, Award, Wifi, Zap, Megaphone } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MarqueeTickerProps {
  customAnnouncement?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ customAnnouncement }) => {
  const baseTickerItems = [
    { icon: Trophy,  text: 'FORUM INSTALLATION & TARANG 2K26 — JULY 30, 2026', tag: 'FLAGSHIP', color: 'text-amber border-amber-500/40 bg-amber-500/10' },
    { icon: Award,   text: '1ST PRIZE · NATIONAL SMART HARDWARE EXPO · ROVER WING', tag: 'VICTORY', color: 'text-lime border-lime/40 bg-lime/10' },
    { icon: Cpu,     text: 'VLSI & RISC-V FPGA SILICON SYNTHESIS LAB BATCH 2026-27 ACTIVE', tag: 'SILICON', color: 'text-cyber-purple border-purple-500/40 bg-purple-500/10' },
    { icon: Radio,   text: 'INDIAN PATENT GRANTED · SUB-GHZ AUTONOMOUS IOT SENSOR GRID', tag: 'PATENT', color: 'text-cyber-emerald border-emerald-500/40 bg-emerald-500/10' },
    { icon: Award,   text: 'IEEE & IETE REGIONAL OUTSTANDING STUDENT CHAPTER AWARD', tag: 'HONOUR', color: 'text-amber border-amber-500/40 bg-amber-500/10' },
    { icon: Wifi,    text: 'LORA MESH TELEMETRY CLUSTER V2 FIELD DEPLOYMENT LIVE', tag: 'MESH NET', color: 'text-lime border-lime/40 bg-lime/10' },
    { icon: Zap,     text: 'EDGE AI TINYML DEPLOYMENT ON STM32F4 CORTEX-M4 BOOTCAMP', tag: 'WORKSHOP', color: 'text-cyber-pink border-pink-500/40 bg-pink-500/10' },
  ];

  const tickerItems = customAnnouncement
    ? [
        {
          icon: Megaphone,
          text: customAnnouncement.toUpperCase(),
          tag: 'LIVE BROADCAST',
          color: 'text-lime border-lime/50 bg-lime/20 animate-pulse',
        },
        ...baseTickerItems,
      ]
    : baseTickerItems;

  return (
    <div className="relative w-full border-y border-white/10 overflow-hidden z-20 bg-[#03050A]">
      {/* Top and Bottom Glowing Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lime/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-purple/40 to-transparent" />

      {/* Left/Right Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#03050A] via-[#03050A]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#03050A] via-[#03050A]/90 to-transparent z-10 pointer-events-none" />

      {/* Left Live Anchor Chip */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#070B16] border border-lime/40 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-lime"></span>
        </span>
        <span className="text-[10px] font-mono text-lime font-extrabold tracking-widest uppercase">
          LIVE TELEMETRY
        </span>
      </div>

      {/* Marquee Track with hover pause */}
      <div
        className="py-3.5 flex w-max animate-marquee items-center gap-0 group hover:[animation-play-state:paused]"
        onMouseEnter={() => soundFx.playHover()}
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-4 px-6 select-none cursor-default">
              {/* Category Tag */}
              <span className={`text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border tracking-widest uppercase shadow-sm ${item.color}`}>
                {item.tag}
              </span>

              {/* Icon */}
              <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              {/* Text */}
              <span className="text-xs font-mono text-slate-200 tracking-wider whitespace-nowrap font-medium">
                {item.text}
              </span>

              {/* High-tech divider */}
              <span className="text-lime/30 font-mono text-sm px-2">❖</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
