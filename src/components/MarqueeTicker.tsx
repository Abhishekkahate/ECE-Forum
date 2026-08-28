import React from 'react';
import { Trophy, Radio, Cpu, Award, Wifi, Zap, Megaphone, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MarqueeTickerProps {
  customAnnouncement?: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ customAnnouncement }) => {
  const base = [
    { icon: Trophy, text: 'FORUM INSTALLATION & TARANG 2K26 — JULY 30', tag: 'FLAGSHIP' },
    { icon: Award, text: '1ST PRIZE · NATIONAL SMART HARDWARE EXPO · ROVER WING', tag: 'VICTORY' },
    { icon: Cpu, text: 'VLSI & RISC-V FPGA — BATCH 2026–27 ACTIVE', tag: 'SILICON' },
    { icon: Radio, text: 'PATENT 492026/IN · SUB-GHZ IOT MESH GRID', tag: 'PATENT' },
    { icon: Award, text: 'IEEE & IETE OUTSTANDING CHAPTER · TOP 1%', tag: 'HONOUR' },
    { icon: Wifi, text: 'LORA MESH V2 FIELD DEPLOYMENT LIVE', tag: 'MESH' },
    { icon: Zap, text: 'TINYML ON STM32F4 · EDGE AI BOOTCAMP', tag: 'WORKSHOP' },
  ];

  const items = customAnnouncement
    ? [{ icon: Megaphone, text: customAnnouncement.toUpperCase(), tag: 'LIVE' }, ...base]
    : base;

  return (
    <div className="relative w-full border-y border-[rgba(255,74,21,0.12)] overflow-hidden bg-[#08080A] backdrop-blur-2xl">
      {/* signal hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/25 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
      </div>

      {/* edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-36 bg-gradient-to-r from-[#08080A] via-[#08080A]/85 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 sm:w-36 bg-gradient-to-l from-[#08080A] via-[#08080A]/85 to-transparent z-10 pointer-events-none" />

      {/* LIVE / DISPATCH pill */}
      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#FF4A15] text-white shadow-[0_6px_18px_rgba(255,74,21,0.35)] border border-white/10">
        <span className="w-5 h-5 rounded-full bg-white text-[#FF4A15] grid place-items-center shadow-inner">
          <Radio className="w-3 h-3" />
        </span>
        <span className="text-[10px] font-mono font-black tracking-[0.14em]">DISPATCH</span>
        <span className="w-px h-3 bg-white/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <ArrowRight className="w-3 h-3 opacity-70" />
      </div>

      <div
        className="py-3.5 flex w-max animate-marquee items-center hover:[animation-play-state:paused]"
        onMouseEnter={() => soundFx.playHover()}
      >
        {[...items, ...items, ...items].map((it, i) => {
          const Icon = it.icon;
          const isLive = it.tag === 'LIVE';
          return (
            <div key={i} className="flex items-center gap-3 px-6 shrink-0">
              <span
                className={`text-[9px] font-mono font-black tracking-[0.14em] px-2 py-1 rounded-full border shrink-0 ${
                  isLive
                    ? 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_0_12px_rgba(255,74,21,0.45)] animate-pulse'
                    : 'bg-[rgba(255,74,21,0.10)] border-[rgba(255,74,21,0.18)] text-[#FF4A15]'
                }`}
              >
                {it.tag}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isLive ? 'text-[#FF4A15]' : 'text-white/35'}`} />
              <span className="text-[11.5px] font-mono tracking-[0.03em] font-medium text-[#F5F3EF]/85 whitespace-nowrap">
                {it.text}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]/50 shadow-[0_0_6px_rgba(255,74,21,0.5)] shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
