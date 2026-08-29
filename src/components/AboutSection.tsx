import React, { useState } from 'react';
import {
  Compass, ArrowUpRight, Check, Cpu, Layers, Sparkles, BookOpen,
  Award, Shield, Terminal, Zap, Radio, Globe, ChevronRight, Activity
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const AboutSection: React.FC = () => {
  const [activeCouncilTab, setActiveCouncilTab] = useState<'both' | 'space' | 'sinc'>('both');
  const revealRef = useScrollReveal(0.08);

  const capabilities = [
    { label: 'Autonomous Systems & ROS 2', desc: 'LiDAR rovers, slam navigation, vision AI', icon: Cpu, wing: 'SINC' },
    { label: 'Silicon & VLSI Prototyping', desc: 'Custom 32-bit RISC-V SoC & FPGA synthesis', icon: Terminal, wing: 'SINC' },
    { label: 'IEEE & IETE Symposiums', desc: 'National student paper publishing & tech conferences', icon: BookOpen, wing: 'SPACE' },
    { label: 'LoRaWAN Edge Mesh', desc: 'Govt granted patent for ultra-low power telemetry', icon: Radio, wing: 'SPACE' },
  ];

  const milestones = [
    { value: '1,500+', label: 'Active Engineers', sub: 'UG & PG Network' },
    { value: '80+', label: 'National Symposia', sub: 'Conferences Hosted' },
    { value: '120+', label: 'Hardware Prototypes', sub: 'Silicon & IoT' },
    { value: '24 LPA', label: 'Tier-1 Silicon Placements', sub: 'Qualcomm, TI, Intel' },
  ];

  return (
    <section id="about" ref={revealRef} className="relative bg-[#08080A] text-[#F5F3EF] overflow-hidden border-t border-white/[0.06] py-20 lg:py-28">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 editorial-grid opacity-[0.04] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[580px] h-[580px] top-[10%] -left-[120px] opacity-[0.14] pointer-events-none" />
      <div className="mesh-blob mesh-blob-cyan w-[500px] h-[500px] bottom-[5%] -right-[100px] opacity-[0.10] pointer-events-none" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12 mb-12 lg:mb-16">
          <div className="reveal max-w-[640px]">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl shadow-glass-sm">
              <span className="w-5 h-5 rounded-full bg-[#FF4A15] text-white grid place-items-center">
                <Compass className="w-3 h-3" />
              </span>
              <span className="text-[11px] font-mono tracking-[0.16em] font-bold text-white/90 uppercase">
                01 — THE ATELIER &amp; DUAL COUNCIL
              </span>
            </div>
            <h2 className="mt-5 font-[Syne] font-[800] tracking-[-0.05em] leading-[0.92] text-[34px] sm:text-[46px] lg:text-[54px] text-white">
              Two councils.
              <br />
              <span className="font-['Instrument_Serif'] font-normal italic tracking-[-0.02em] text-[#FF4A15]">
                One unified engineering culture.
              </span>
            </h2>
          </div>
          <div className="reveal stagger-2 max-w-[440px] space-y-3">
            <p className="text-[14px] sm:text-[14.5px] leading-[1.75] text-white/60">
              <strong className="text-white font-semibold">SPACE</strong> drives research conferences, student journals, and academic chapters.{' '}
              <strong className="text-[#FF4A15] font-semibold">SINC</strong> engineers production hardware — autonomous rovers, RISC-V silicon cores, and LoRa edge nodes.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
              <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" /> PIET ECE DEPARTMENT OPERATING SYSTEM 2026–27
            </div>
          </div>
        </div>

        {/* Council Interactive Switcher */}
        <div className="flex justify-center sm:justify-start mb-8 reveal">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#0F0F11] border border-white/[0.08] backdrop-blur-xl">
            {[
              { id: 'both', label: 'Dual Council Architecture', icon: Layers },
              { id: 'space', label: 'SPACE (Academic & Research)', icon: BookOpen },
              { id: 'sinc', label: 'SINC (Hardware & Innovation)', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeCouncilTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveCouncilTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF4A15] text-white font-bold shadow-[0_4px_16px_rgba(255,74,21,0.35)]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Atelier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column — Council Telemetry & Verified Emblem Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-[96px] reveal space-y-4">
            <div className="relative rounded-[26px] bg-[#0F0F11] border border-white/[0.08] p-5 sm:p-6 overflow-hidden shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.14em] text-white/40 pb-4 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF4A15]" /> SPECS // ATELIER 01
                </span>
                <span className="inline-flex items-center gap-1 text-[#00FF88] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" /> VERIFIED APEX
                </span>
              </div>

              {/* Council Visual Emblem Dual Stage */}
              <div className="relative rounded-[20px] bg-[#050507] border border-white/[0.06] my-5 p-6 grid place-items-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,74,21,0.12),transparent_70%)]" />
                <div className="relative flex items-center gap-5 sm:gap-7">
                  {/* SPACE Logo Plate */}
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-[84px] h-[84px] sm:w-[90px] sm:h-[90px] rounded-2xl bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_12px_32px_rgba(245,243,239,0.12)] border border-white/20 group-hover:scale-105 transition-transform duration-300">
                      <img src="/space_logo.webp" alt="SPACE Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10.5px] font-mono tracking-[0.14em] font-bold text-white">SPACE</span>
                    <span className="text-[9.5px] font-mono text-[#00E5CC] font-bold">ESTD 2012</span>
                  </div>

                  <span className="text-white/25 font-mono text-xl font-bold">×</span>

                  {/* SINC Logo Plate */}
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-[84px] h-[84px] sm:w-[90px] sm:h-[90px] rounded-2xl bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_12px_32px_rgba(255,74,21,0.15)] border border-[#FF4A15]/40 group-hover:scale-105 transition-transform duration-300">
                      <img src="/sinc_logo.webp" alt="SINC Logo" className="w-full h-full object-contain" style={{ filter: 'brightness(0.15)' }} />
                    </div>
                    <span className="text-[10.5px] font-mono tracking-[0.14em] font-bold text-white">SINC</span>
                    <span className="text-[9.5px] font-mono text-[#FF4A15] font-bold">ESTD 2018</span>
                  </div>
                </div>
              </div>

              {/* Department Numbers */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                {[
                  { k: '1,500+', l: 'Engineers' },
                  { k: '80+', l: 'Symposia' },
                  { k: '120+', l: 'Prototypes' },
                ].map((s) => (
                  <div key={s.k} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="font-[Syne] font-[800] text-[15px] sm:text-[17px] text-white leading-none">
                      {s.k}
                    </div>
                    <div className="text-[9.5px] font-mono tracking-[0.08em] text-white/40 mt-1 uppercase">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capability highlight box */}
            <div className="p-4 rounded-2xl bg-[rgba(255,74,21,0.06)] border border-[#FF4A15]/20 text-xs font-mono text-white/70 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#FF4A15] font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Departmental Focus
              </div>
              <p className="text-[11.5px] leading-relaxed text-white/60">
                Jointly orchestrating technical hackathons, semiconductor synthesis, IEEE publications, and the annual TARANG 2K26 technical fiesta.
              </p>
            </div>
          </div>

          {/* Right Column — The Dual Council Dossier Cards */}
          <div className="lg:col-span-8 space-y-6 reveal stagger-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SPACE CARD */}
              {(activeCouncilTab === 'both' || activeCouncilTab === 'space') && (
                <div className="group relative rounded-[24px] bg-[#0F0F11]/90 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-2xl hover:border-[#00E5CC]/40 hover:bg-[#12141a] transition-all duration-300 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono tracking-[0.16em] text-[#00E5CC] font-bold">
                        01 — SCHOLARLY FOUNDATION
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                        ESTD 2012
                      </span>
                    </div>
                    <h3 className="mt-3 font-[Syne] font-[800] tracking-[-0.03em] text-[22px] sm:text-[24px] text-white">
                      SPACE
                    </h3>
                    <div className="text-[11px] font-mono text-white/40 mt-0.5">
                      Students&apos; Progressive Association of Communication Engineers
                    </div>
                    <p className="mt-4 text-[13.5px] leading-[1.7] text-white/65">
                      Fostering academic rigor, international research publications, <strong className="text-white font-medium">ELEKTRONIKOS</strong> magazine, and student IEEE chapters.
                    </p>

                    <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/35 uppercase">
                          Faculty Incharge
                        </div>
                        <div className="mt-1 text-[12.5px] font-semibold text-white">
                          Dr. Sunita N. Parihar
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/35 uppercase">
                          Council President
                        </div>
                        <div className="mt-1 text-[12.5px] font-semibold text-[#00E5CC]">
                          Rohan Virutkar
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {['IEEE Chapter', 'Research Papers', 'TARANG Gala', 'ELEKTRONIKOS', 'Academic Board'].map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playLaser();
                      document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[12px] font-mono font-bold text-white hover:bg-white hover:text-black transition-all group/btn cursor-pointer"
                  >
                    <span>Inspect SPACE Leadership</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {/* SINC CARD */}
              {(activeCouncilTab === 'both' || activeCouncilTab === 'sinc') && (
                <div className="group relative rounded-[24px] bg-[#0F0F11]/90 border border-[#FF4A15]/20 p-6 sm:p-7 backdrop-blur-2xl hover:border-[#FF4A15]/50 hover:bg-[#151210] transition-all duration-300 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono tracking-[0.16em] text-[#FF4A15] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-ping" />
                        02 — HARDWARE ENGINE
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/20 text-[10px] font-mono text-[#FF4A15] font-bold">
                        ESTD 2018
                      </span>
                    </div>
                    <h3 className="mt-3 font-[Syne] font-[800] tracking-[-0.03em] text-[22px] sm:text-[24px] text-white">
                      SINC
                    </h3>
                    <div className="text-[11px] font-mono text-white/40 mt-0.5">
                      Student Innovation Council
                    </div>
                    <p className="mt-4 text-[13.5px] leading-[1.7] text-white/65">
                      The department&apos;s product development division. Autonomous ROS 2 rovers, custom VLSI design, government patent grants &amp; LoRaWAN networks.
                    </p>

                    <div className="mt-6 pt-5 border-t border-[#FF4A15]/15 grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-[#FF4A15]/[0.04] border border-[#FF4A15]/10">
                        <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/35 uppercase">
                          Faculty Incharge
                        </div>
                        <div className="mt-1 text-[12.5px] font-semibold text-white">
                          Ms. V. V. Shirpurkar
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FF4A15]/[0.04] border border-[#FF4A15]/10">
                        <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/35 uppercase">
                          Council President
                        </div>
                        <div className="mt-1 text-[12.5px] font-semibold text-[#FF4A15]">
                          Makarand Bahmane
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {['Autonomous Rovers', 'Govt Patents', 'VLSI Synthesis', 'Robotics Arena', 'LoRa Mesh'].map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/20 text-[#FF4A15] font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playLaser();
                      document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#FF4A15] text-[12px] font-mono font-bold text-white hover:bg-[#FF4A15]/80 transition-all group/btn cursor-pointer shadow-lg"
                  >
                    <span>Inspect SINC Wings &amp; Projects</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Core Capability Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {capabilities.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all flex items-start gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-[#FF4A15] grid place-items-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{c.label}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                          {c.wing}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-white/50 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verified Proof Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
              {['IEEE & IETE Top 1%', 'Govt Patent 492026/IN', '₹1L National Hackathon Win', '24 LPA Peak Package', '48+ Published Papers'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-white/60"
                >
                  <Check className="w-3 h-3 text-[#00FF88]" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
