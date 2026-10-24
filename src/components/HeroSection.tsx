import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowDown, Cpu, Bot, Radio, Brain, ArrowUpRight, Play, Zap, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { type SiteHeroConfig, DEFAULT_HERO_CONFIG } from '../services/api';

const Chip3DViewer = React.lazy(() => import('./Chip3DViewer').then(m => ({ default: m.Chip3DViewer })));

interface HeroSectionProps {
  onExploreEvents: () => void;
  onJoinCommunity: () => void;
  heroConfig?: SiteHeroConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreEvents,
  onJoinCommunity,
  heroConfig = DEFAULT_HERO_CONFIG,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [liveTime, setLiveTime] = useState('');
  const { scrollY } = useScroll();
  const yWatermark = useTransform(scrollY, [0, 700], [0, 36]);
  const yBlob = useTransform(scrollY, [0, 700], [0, -28]);
  const yBlob2 = useTransform(scrollY, [0, 700], [0, 32]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('[data-hero-item]');
    items.forEach((item, idx) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(18px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 90 + idx * 80);
    });
  }, []);

  return (
    <section id="hero" ref={containerRef} className="relative bg-[#08080A] overflow-hidden overflow-x-clip border-b border-white/[0.06]">
      {/* blueprint base */}
      <div className="absolute inset-0 bg-[#08080A]" />
      <div className="absolute inset-0 editorial-grid opacity-[0.07] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,243,239,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,243,239,0.03)_1px,transparent_1px)] bg-[size:120px_120px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_78%)] pointer-events-none opacity-[0.22]" />
      {/* signal wash — parallax */}
      <motion.div style={{ y: yBlob }} className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1600px] h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(255,74,21,0.09),transparent_62%)] pointer-events-none" />
      <motion.div style={{ y: yBlob2 }} className="absolute top-[34%] -right-[180px] w-[560px] h-[560px] bg-[radial-gradient(circle_at_center,rgba(0,229,204,0.05),transparent_70%)] rounded-full blur-[20px] pointer-events-none" />

      {/* LEFT RAIL — vertical section plate */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-[56px] border-r border-white/[0.06] bg-[rgba(10,10,12,0.55)] backdrop-blur-xl flex-col items-center py-6 z-20">
        <span className="text-[10px] font-mono tracking-[0.22em] text-white/25 [writing-mode:vertical-rl] rotate-180">ATELIER NO.08 — PCE-NAGPUR — 21.14°N</span>
        <span className="mt-auto text-[10px] font-mono tracking-[0.18em] text-[#FF4A15] font-bold [writing-mode:vertical-rl] rotate-180">COVER — SPEC 001</span>
        <span className="mt-4 w-px h-16 bg-gradient-to-b from-[#FF4A15] to-transparent" />
        <span className="mt-4 w-2 h-2 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)] animate-pulse" />
      </div>

      <div className="relative lg:pl-[56px]">
        {/* TOP SPEC BAR — datasheet header — single bar only (mobile duplicate removed) */}
        <div data-hero-item className="hidden lg:flex items-stretch border-b border-white/[0.06] bg-[rgba(14,14,16,0.72)] backdrop-blur-xl text-[10px] font-mono tracking-[0.12em] text-white/40">
          <div className="flex items-center gap-2 px-5 py-2.5 border-r border-white/[0.06]">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A15] opacity-60" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF4A15]" /></span>
            <span className="text-white/50">SESSION</span> <strong className="text-[#FF4A15] tracking-[0.10em]">{heroConfig.heroSession || '2026—27'}</strong>
          </div>
          <div className="hidden xl:flex items-center gap-3 px-5 border-r border-white/[0.06]"><span>DEPT</span> <strong className="text-[#F5F3EF]">ECE</strong> <span className="opacity-30">/</span> <span>FORUM</span> <strong className="text-[#F5F3EF]">{heroConfig.heroForumTitle || 'SPACE × SINC'}</strong></div>
          <div className="flex items-center gap-2 px-5 border-r border-white/[0.06]"><Clock3 className="w-3 h-3 text-[#FF4A15]" /> IST {liveTime || '10:00 AM'} <span className="opacity-30">·</span> 1,500+ ENGINEERS</div>
          <div className="ml-auto flex items-center gap-2 px-5 text-white/25"><span>SCALE 1:1</span> <span className="w-px h-3 bg-white/10" /> <span>REF PCE-NAGPUR/ECE/2026</span></div>
        </div>

        {/* COVER — editorial, airy */}
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-8 sm:pt-10 lg:pt-14 xl:pt-16 pb-8 lg:pb-10">
          {/* faint blueprint watermark — parallax on scroll */}
          <motion.div style={{ y: yWatermark }} className="pointer-events-none absolute -top-2 -left-4 right-0 select-none hidden lg:block overflow-hidden">
            <span className="font-[Syne] font-[800] tracking-[-0.06em] leading-none text-[120px] xl:text-[148px] text-white/[0.022] whitespace-nowrap">SPACE × SINC — 08 — MMXII — MMXVIII</span>
          </motion.div>

          {/* 12-col grid prevents hardware overlap on 1280px */}
          <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-start">
            {/* LEFT — type */}
            <div data-hero-item className="lg:col-span-7 xl:col-span-7 relative min-w-0">
              {/* Category / Telemetry Strip */}
              <div className="inline-flex items-center gap-2.5 mb-4 sm:mb-6 flex-wrap">
                <span className="inline-flex items-center gap-1.5 border border-[#FF4A15]/25 bg-[#FF4A15]/[0.08] px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] shadow-[0_0_8px_rgba(255,74,21,0.6)] animate-pulse" />
                  <span className="text-[9.5px] font-mono font-bold tracking-[0.16em] text-[#FF4A15]">PCE-NAGPUR · EST. 2026</span>
                </span>
                <span className="hidden sm:inline h-px w-6 bg-white/10" />
                <span className="hidden sm:inline text-[9.5px] font-mono tracking-[0.14em] text-white/35">21.14°N 79.08°E</span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[9.5px] font-mono font-normal tracking-[0.12em] text-[#00E5CC] border border-[#00E5CC]/20 rounded-full px-2.5 py-0.5 bg-[#00E5CC]/[0.04]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC] animate-ping" />
                  DUAL ATELIER
                </span>
              </div>

              {/* Creative Hero Headline */}
              <h1 className="font-[Syne] font-[800] tracking-[-0.045em] leading-[0.88] text-[46px] xs:text-[54px] sm:text-[68px] lg:text-[74px] xl:text-[84px] max-w-[620px]">
                <span className="block text-[#F5F3EF]">
                  Department
                </span>
                <span className="flex items-baseline gap-2.5 sm:gap-4 -mt-1 sm:-mt-2 pb-1">
                  <span className="font-['Instrument_Serif'] font-normal italic tracking-[-0.02em] text-[#FF4A15] text-[1.1em]">
                    of
                  </span>
                  <span className="relative inline-block tracking-[-0.02em]">
                    <span className="bg-gradient-to-r from-[#FF4A15] via-[#FF7A45] to-[#FFA07A] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(255,74,21,0.25)]">
                      ECE
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF4A15] via-[#FF7A45] to-transparent rounded-full" />
                  </span>
                </span>
              </h1>

              {/* Engineering Discipline Pill Ribbon */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur text-[12px] sm:text-[13px] font-mono text-white/90">
                  <Cpu className="w-3.5 h-3.5 text-[#FF4A15]" />
                  <span className="font-semibold text-white/80">Electronics &amp; Communication Engineering</span>
                </div>
              </div>

              {/* description */}
              <div className="mt-4 sm:mt-5 max-w-[540px] flex gap-3">
                <span className="hidden sm:block w-px self-stretch bg-gradient-to-b from-[#FF4A15]/50 via-white/10 to-transparent mt-1 shrink-0" />
                <p className="text-[14px] sm:text-[15px] leading-[1.7] text-white/55">
                  PCE-NAGPUR&apos;s premier dual-council atelier — <strong className="text-white font-semibold">SPACE</strong> for Cultural, Sports, &amp; Other Events, and <strong className="text-[#FF4A15] font-semibold">SINC</strong> for Technical skills, Competitions &amp; Workshops.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => { soundFx.playLaser(); onExploreEvents(); }} className="group inline-flex items-center gap-2.5 bg-[#FF4A15] text-white pl-5 pr-1.5 py-1.5 rounded-full font-bold text-[13px] tracking-[-0.01em] hover:bg-[#E84410] hover:shadow-[0_10px_30px_rgba(255,74,21,0.35)] transition-all">
                  <Zap className="w-3.5 h-3.5 fill-white" /> Explore Events <span className="ml-1 w-7 h-7 rounded-full bg-white text-[#FF4A15] grid place-items-center group-hover:translate-x-0.5 transition-transform"><ArrowRight className="w-3.5 h-3.5" /></span>
                </button>
                <button onClick={() => { soundFx.playClick(); onJoinCommunity(); }} className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] backdrop-blur px-4 py-2 text-[13px] font-medium text-[#F5F3EF] hover:bg-white/[0.08] hover:border-white/20 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-[#F5F3EF] text-[#08080A] grid place-items-center"><Play className="w-2.5 h-2.5 ml-0.5 fill-current" /></span> Meet the leaders <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                </button>
              </div>

              {/* Telemetry Council Row — anchors bottom of column */}
              <div className="mt-7 pt-5 border-t border-white/[0.08] grid grid-cols-3 gap-3 max-w-[500px]">
                <div>
                  <div className="text-[9.5px] font-mono tracking-[0.14em] text-white/35 uppercase">Council 01</div>
                  <div className="text-[15px] sm:text-[17px] font-[Syne] font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <span>SPACE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC]" />
                  </div>
                  <div className="text-[10px] font-mono text-white/45 mt-0.5">Cultural &amp; Forum</div>
                </div>
                <div className="border-l border-white/[0.08] pl-3.5">
                  <div className="text-[9.5px] font-mono tracking-[0.14em] text-white/35 uppercase">Council 02</div>
                  <div className="text-[15px] sm:text-[17px] font-[Syne] font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <span>SINC</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]" />
                  </div>
                  <div className="text-[10px] font-mono text-[#FF4A15] mt-0.5 font-medium">Technical Club</div>
                </div>
                <div className="border-l border-white/[0.08] pl-3.5">
                  <div className="text-[9.5px] font-mono tracking-[0.14em] text-white/35 uppercase">Edition</div>
                  <div className="text-[15px] sm:text-[17px] font-[Syne] font-extrabold text-white mt-0.5">2026–27</div>
                  <div className="text-[10px] font-mono text-[#00FF88] mt-0.5 font-medium">Active Council</div>
                </div>
              </div>
            </div>

            {/* RIGHT — hardware figure — 400px max, no overlap */}
            <div data-hero-item className="lg:col-span-5 xl:col-span-5 relative min-w-0 lg:pt-2">
              <div className="relative max-w-[400px] lg:ml-auto mx-auto lg:mx-0">
                <div className="absolute -inset-3 rounded-[28px] bg-[radial-gradient(ellipse_at_top,_rgba(255,74,21,0.10),_transparent_62%)] blur-[18px] pointer-events-none" />
                <div className="relative rounded-[24px] bg-[#0F0F11] border border-white/[0.08] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/25 to-transparent" />
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_right,rgba(245,243,239,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,243,239,0.6)_1px,transparent_1px)] bg-[size:18px_18px]" />
                  <div className="relative rounded-[16px] overflow-hidden bg-[#050507] border border-white/[0.06] min-h-[260px] grid place-items-center">
                    <React.Suspense fallback={<div className="w-full h-[260px] animate-pulse bg-white/[0.04] grid place-items-center text-[11px] font-mono tracking-[0.12em] text-white/30">LOADING SILICON — FIG. 01</div>}>
                      <Chip3DViewer />
                    </React.Suspense>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1 pt-2.5 text-[10px] font-mono tracking-[0.08em] text-white/40">
                    <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse" /> FIG. 01 — SILICON CORE — SCALE 1:1</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-white/25"><span className="w-1 h-1 rounded-full bg-white/20" /> XILINX ARTIX-7</span>
                  </div>
                </div>
              </div>
              {/* COUNCIL STRIP — under figure */}
              <div className="mt-3 grid grid-cols-2 gap-2 max-w-[400px] lg:ml-auto mx-auto lg:mx-0">
                <button onClick={() => { soundFx.playLaser(); onJoinCommunity(); }} className="group flex items-center gap-2 rounded-full bg-[#F5F3EF] text-[#08080A] pl-1 pr-2.5 py-1 text-left hover:bg-white transition-colors">
                  <span className="w-7 h-7 rounded-full bg-white border border-black/10 p-1 grid place-items-center shrink-0"><img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" /></span>
                  <span className="min-w-0"><span className="block text-[11px] font-extrabold leading-none">SPACE</span><span className="block text-[9px] font-mono tracking-[0.06em] text-black/45 leading-none mt-0.5">2026 · Overall</span></span>
                  <ArrowUpRight className="ml-auto w-3 h-3 text-black/30 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button onClick={() => { soundFx.playLaser(); onJoinCommunity(); }} className="group flex items-center gap-2 rounded-full bg-[#FF4A15] text-white pl-1 pr-2.5 py-1 text-left hover:bg-[#E84410] transition-colors shadow-[0_6px_20px_rgba(255,74,21,0.35)]">
                  <span className="w-7 h-7 rounded-full bg-white p-1 grid place-items-center shrink-0"><img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" /></span>
                  <span className="min-w-0"><span className="block text-[11px] font-extrabold leading-none">SINC</span><span className="block text-[9px] font-mono tracking-[0.06em] text-white/70 leading-none mt-0.5">2026 · Technical</span></span>
                  <ArrowUpRight className="ml-auto w-3 h-3 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* SPEC RUNWAY — responsive, no horizontal scroll */}
          <div data-hero-item className="mt-10 lg:mt-12 overflow-hidden rounded-2xl lg:rounded-none border border-white/[0.06] lg:border-x-0 lg:border-y bg-[rgba(12,12,14,0.55)] backdrop-blur-xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
              {[
                { k: '01', icon: Cpu, label: 'Electronics', spec: 'VLSI & Semconductors' },
                { k: '02', icon: Bot, label: 'Robotics', spec: 'Industrial Robots & Drones' },
                { k: '03', icon: Radio, label: 'IoT Systems', spec: 'Arduino , ESP , STM32' },
                { k: '04', icon: Brain, label: 'Communication', spec: '5G , Antennas , RF' },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.k} className="flex items-center gap-3 px-4 sm:px-5 py-4 group hover:bg-white/[0.03] transition-colors min-w-0">
                    <span className="text-[10px] font-mono tracking-[0.14em] text-white/20">{r.k}</span>
                    <span className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.07] grid place-items-center text-white/60 group-hover:bg-[#FF4A15] group-hover:text-white group-hover:border-[#FF4A15] transition-colors shrink-0"><Icon className="w-3.5 h-3.5" /></span>
                    <span className="min-w-0"><span className="block text-xs font-bold tracking-[-0.01em] text-[#F5F3EF] leading-none truncate">{r.label}</span><span className="block text-[10px] font-mono tracking-[0.06em] text-white/30 leading-none mt-1 truncate">{r.spec}</span></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTNOTE — lighter */}
          <div data-hero-item className="mt-7 flex flex-wrap items-center gap-2.5 text-[11px]">
            <span className="text-white/35 font-mono text-[11px] tracking-[0.05em]">REF: PCE-NAGPUR/ECE/2026-27  — VERIFIED</span>
          </div>
        </div>

        {/* bottom scroll cue as blueprint fold */}
        <div className="hidden lg:flex items-center justify-center gap-3 py-3 text-white/20 border-t border-white/[0.04] bg-[rgba(10,10,12,0.4)] backdrop-blur">
          <span className="text-[10px] font-mono tracking-[0.20em]">FOLD — SCROLL TO UNFOLD MANUAL</span>
          <span className="w-16 h-px bg-white/10 relative overflow-hidden rounded-full"><span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4A15] to-transparent w-1/3 animate-shimmer" /></span>
          <ArrowDown className="w-3.5 h-3.5 text-[#FF4A15] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
