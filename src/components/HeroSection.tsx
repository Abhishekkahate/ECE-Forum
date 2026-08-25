import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowDown, ChevronRight, Zap, Terminal, Clock, Cpu, Bot, Radio, Brain } from 'lucide-react';
import { Chip3DViewer } from './Chip3DViewer';
import { soundFx } from '../utils/audio';
import { OptimizedImage } from './OptimizedImage';

import { type SiteHeroConfig, DEFAULT_HERO_CONFIG } from '../services/api';

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
  const [liveTime, setLiveTime] = useState<string>('');

  // Live real-time clock indicator (IST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Staggered entrance animation on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('[data-hero-item]');
    items.forEach((item, idx) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 + idx * 80);
    });
  }, []);

  const featurePills = [
    { icon: Cpu,    label: 'VLSI Silicon',       color: 'text-lime border-lime/30' },
    { icon: Bot,    label: 'Robotics',           color: 'text-cyber-purple border-purple-400/30' },
    { icon: Radio,  label: 'IoT & LoRaWAN',      color: 'text-amber border-amber-400/30' },
    { icon: Brain,  label: 'Edge AI',            color: 'text-cyber-emerald border-emerald-400/30' },
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16"
    >
      {/* ── Volumetric Atmospheric Glows ─────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-radial from-lime/10 via-cyber-purple/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-gradient-radial from-amber/8 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Laser Separator Line */}
      <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── LEFT: Headline & Cybernetic HUD (7 cols) ──────── */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Live System Telemetry Eyebrow */}
            <div data-hero-item className="inline-flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <div className="section-eyebrow-hud shadow-[0_0_20px_rgba(0,242,254,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime"></span>
                </span>
                <span>{heroConfig.heroSession || '2026-27'}</span>
                <span className="text-white/30">•</span>
                <span className="text-slate-300 font-bold">{heroConfig.heroForumTitle || 'PIET ECE FORUM'}</span>
              </div>

              {liveTime && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-deep/90 border border-white/10 text-[10px] font-mono text-slate-400 backdrop-blur-md shadow-sm">
                  <Clock className="w-3 h-3 text-lime animate-pulse" />
                  <span>IST <strong className="text-white">{liveTime}</strong></span>
                </div>
              )}
            </div>

            {/* Monumental Headline */}
            <div data-hero-item className="space-y-2">
              <h1 className="font-space text-5xl sm:text-6xl lg:text-7xl xl:text-[5.4rem] font-extrabold tracking-[-0.04em] text-white leading-[1.0] select-none">
                Architecting
                <br />
                <span className="text-gradient-cyan">Tomorrow's</span>
                <br />
                Silicon &amp; Systems.
              </h1>
            </div>

            {/* Sub-headline Description */}
            <p data-hero-item className="text-sm sm:text-base text-slate-300 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Advancing hardware prototyping, autonomous robotics, VLSI design, and edge intelligence at PIET.
            </p>

            {/* Capability Feature Chips */}
            <div data-hero-item className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {featurePills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-midnight-deep/80 border ${pill.color} text-[10px] font-mono font-bold tracking-wider backdrop-blur-md shadow-sm hover:scale-105 transition-transform cursor-default`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Dual Council Interactive Cards */}
            <div data-hero-item className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 pt-1">
              {/* SPACE */}
              <div
                onMouseEnter={() => soundFx.playHover()}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#080D1A]/90 border border-amber-500/25 hover:border-amber-400/60 transition-all duration-300 group cursor-default shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,184,0,0.2)]"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 p-1 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <OptimizedImage src="/space_logo.webp" alt="SPACE" priority className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(255,184,0,0.6)]" wrapperClassName="w-full h-full" />
                </div>
                <div className="text-left">
                  <span className="block font-space font-extrabold text-xs text-white group-hover:text-amber transition-colors">
                    SPACE FORUM
                  </span>
                  <span className="block text-[9px] font-mono text-slate-400">
                    Academic &amp; Research
                  </span>
                </div>
              </div>

              {/* SINC */}
              <div
                onMouseEnter={() => soundFx.playHover()}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#080D1A]/90 border border-lime/25 hover:border-lime/60 transition-all duration-300 group cursor-default shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,242,254,0.2)]"
              >
                <div className="w-9 h-9 rounded-xl bg-lime/10 border border-lime/30 p-1 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <OptimizedImage src="/sinc_logo.webp" alt="SINC" priority className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]" wrapperClassName="w-full h-full" />
                </div>
                <div className="text-left">
                  <span className="block font-space font-extrabold text-xs text-white group-hover:text-lime transition-colors">
                    SINC COUNCIL
                  </span>
                  <span className="block text-[9px] font-mono text-slate-400">
                    Innovation &amp; Prototyping
                  </span>
                </div>
              </div>
            </div>

            {/* Fast Action CTA Group */}
            <div data-hero-item className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              {/* Primary CTA */}
              <button
                onClick={() => { soundFx.playLaser(); onExploreEvents(); }}
                id="hero-explore-events-btn"
                className="btn-cyber-primary w-full sm:w-auto shadow-[0_0_30px_rgba(0,242,254,0.35)] cursor-pointer group text-xs"
              >
                <Zap className="w-4 h-4 fill-midnight" />
                <span>Explore Events</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => { soundFx.playClick(); onJoinCommunity(); }}
                id="hero-about-btn"
                className="btn-cyber-secondary w-full sm:w-auto hover:border-lime/50 cursor-pointer group text-xs"
              >
                <Terminal className="w-4 h-4 text-lime" />
                <span>About Forum</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Live Telemetry Coordinates Ribbon */}
            <div data-hero-item className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span>DEPT: <strong className="text-white">ECE</strong></span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                <span>CAMPUS: <strong className="text-white">PIET</strong></span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                <span>STUDENTS: <strong className="text-white">1,500+</strong></span>
              </span>
            </div>
          </div>

          {/* ── RIGHT: 3D Holographic Silicon Core (5 cols) ───── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            <Chip3DViewer />
          </div>
        </div>

        {/* ── Scroll Guide Indicator ─────────────────────────── */}
        <div className="hidden lg:flex flex-col items-center mt-12 gap-2 text-slate-500">
          <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-slate-400">
            Scroll to Navigate Architecture
          </span>
          <div className="relative w-px h-12 overflow-hidden bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime to-transparent animate-scan-line" />
          </div>
          <ArrowDown className="w-3.5 h-3.5 text-lime animate-bounce" />
        </div>
      </div>
    </section>
  );
};
