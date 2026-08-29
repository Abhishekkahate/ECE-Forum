import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trophy, Award, FileCheck2, Briefcase, ExternalLink, X, ShieldCheck,
  Stamp, Layers, Verified, Sparkles, CheckCircle2, ChevronRight, Hash
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const AchievementsSection: React.FC = () => {
  const [selectedPatent, setSelectedPatent] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Competition' | 'Patent' | 'Academic' | 'Placement'>('All');
  const revealRef = useScrollReveal(0.08);

  useEffect(() => {
    if (selectedPatent || selectedItem) {
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      document.body.style.overflow = 'hidden';
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedPatent(false);
          setSelectedItem(null);
        }
      };
      window.addEventListener('keydown', onEsc);
      return () => {
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    } else {
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
      document.body.style.overflow = '';
    }
  }, [selectedPatent, selectedItem]);

  const stats = [
    { label: 'CASH PRIZES WON', val: '₹1.5L+', sub: 'National Circuit' },
    { label: 'PATENT GRANTS', val: 'IN 492026', sub: 'Govt of India' },
    { label: 'IEEE RANKING', val: 'TOP 1%', sub: 'Regional Chapter' },
    { label: 'PEAK PACKAGE', val: '24 LPA', sub: 'Silicon Tier-1' },
  ];

  const items = [
    {
      index: '01',
      category: 'Competition',
      type: 'NATIONAL CHAMPION',
      title: '1st Prize — National Smart Hardware Expo',
      team: 'Autonomous Rover Wing · SINC',
      desc: 'LiDAR search & rescue rover built on custom RISC-V SoC — 1st place among 120+ national engineering colleges.',
      metric: '₹1,00,000 CASH PRIZE',
      Icon: Trophy,
      color: 'from-[#FF4A15]/[0.14] to-transparent',
      stamp: 'VERIFIED 1ST',
      dossier: 'DOSSIER / EXPO-NHE-2025',
      fullDetails: 'Custom 3D-printed chassis, embedded Jetson Orin Nano neural vision compute, autonomous 3D SLAM mapping, and live wireless video telemetry over 5.8 GHz.',
    },
    {
      index: '02',
      category: 'Patent',
      type: 'PATENT GRANTED',
      title: 'Govt Patent: Low-Power Edge IoT Mesh',
      team: 'ECE Research Cell & SPACE',
      desc: 'Ultra-low power LoRaWAN mesh communication node — Indian patent granted by Govt of India.',
      metric: 'PATENT IN 492026',
      Icon: FileCheck2,
      action: true,
      color: 'from-[#FF4A15]/[0.18] to-[#FF7A45]/[0.08]',
      stamp: 'GRANTED',
      dossier: 'DOSSIER / PAT-IN-492026',
      fullDetails: 'Energy harvesting Sub-GHz RF transceiver system operating down to 1.8V with battery endurance surpassing 4 years on a single coin-cell in continuous telemetry mode.',
    },
    {
      index: '03',
      category: 'Academic',
      type: 'INSTITUTIONAL HONOUR',
      title: 'Outstanding Student Chapter Excellence',
      team: 'Executive Council · SPACE',
      desc: 'IEEE & IETE regional excellence award for conducting 45+ hands-on workshops, conferences & student publications.',
      metric: 'TOP 1% CHAPTER',
      Icon: Award,
      color: 'from-[#FF4A15]/[0.12] to-transparent',
      stamp: 'HONOURED',
      dossier: 'DOSSIER / IEEE-IETE-2025',
      fullDetails: 'Over 1,200 participants across 6 inter-college symposia, 48 indexed research publications in Scopus and IEEE Xplore, and publication of the annual ELEKTRONIKOS journal.',
    },
    {
      index: '04',
      category: 'Placement',
      type: 'CAREER MILESTONE',
      title: 'Tier-1 Silicon Semiconductor Placements',
      team: 'Placement & Industry Cell',
      desc: 'Core placements in Texas Instruments, Qualcomm, Intel, Cadence, Synopsys and NXP Semiconductors.',
      metric: '24 LPA PEAK',
      Icon: Briefcase,
      color: 'from-[#FF4A15]/[0.12] to-transparent',
      stamp: 'PLACED',
      dossier: 'DOSSIER / PLACEMENT-2025',
      fullDetails: 'Direct recruitment in ASIC verification, FPGA synthesis, physical design, and embedded firmware engineering across global semiconductor leaders.',
    },
  ];

  const filteredItems = items.filter((it) => activeCategory === 'All' || it.category === activeCategory);

  return (
    <section id="achievements" ref={revealRef} className="relative py-16 lg:py-24 bg-[#08080A] text-[#F5F3EF] overflow-hidden border-t border-white/[0.06]">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 editorial-grid opacity-[0.05]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,74,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.10) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-[90px] opacity-[0.10] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #FF4A15 0%, transparent 70%)' }}
        />
      </div>
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      {/* LEFT RAIL — vertical technical border text */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-[56px] border-r border-white/[0.06] bg-[rgba(10,10,12,0.45)] backdrop-blur-xl flex-col items-center py-8 z-20 pointer-events-none">
        <span className="text-[10px] font-mono tracking-[0.22em] text-white/30 [writing-mode:vertical-rl] rotate-180">
          PRESTIGE &amp; HONOURS — CH 05
        </span>
        <span className="mt-auto text-[10px] font-mono tracking-[0.18em] text-[#FF4A15] font-bold [writing-mode:vertical-rl] rotate-180">
          HONOURS — SPEC 005
        </span>
        <span className="mt-4 w-px h-16 bg-gradient-to-b from-[#FF4A15]/60 to-transparent" />
        <span className="mt-4 w-2 h-2 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)] animate-pulse" />
      </div>

      {/* RIGHT RAIL — vertical margin ruler on ultrawide */}
      <div className="hidden 2xl:flex absolute right-0 top-0 bottom-0 w-[48px] border-l border-white/[0.06] bg-[rgba(10,10,12,0.25)] flex-col items-center py-8 z-20 pointer-events-none">
        <span className="text-[9.5px] font-mono tracking-[0.20em] text-white/20 [writing-mode:vertical-rl] rotate-180">
          PATENT IN 492026 // IP INDIA
        </span>
        <span className="mt-auto text-[9.5px] font-mono tracking-[0.16em] text-white/30 [writing-mode:vertical-rl] rotate-180">
          SCALE 1:1 // 2026
        </span>
      </div>

      <div className="relative lg:pl-[56px] 2xl:pr-[48px]">
        {/* faint blueprint watermark */}
        <div className="pointer-events-none absolute top-2 left-4 right-4 select-none hidden xl:block overflow-hidden opacity-[0.018]">
          <span className="font-[Syne] font-[800] tracking-[-0.06em] leading-none text-[120px] text-white whitespace-nowrap">
            PRESTIGE &amp; PATENTS — ATELIER No.08
          </span>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div className="reveal max-w-[640px]">
              <div className="section-eyebrow-hud">
                <Trophy className="w-3.5 h-3.5" /> 05 — PRESTIGE &amp; HONOURS
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-2.5 border-l border-[rgba(255,74,21,0.22)] text-white/40 tracking-[0.08em] normal-case">
                  AUDITED 2026 · VERIFIED
                </span>
              </div>
              <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.05em] leading-[0.88] text-[34px] sm:text-[44px] lg:text-[52px] text-[#F5F3EF]">
                Verified <span className="font-['Instrument_Serif'] italic font-[400] text-[#FF4A15]">victories</span>
                <span className="block text-white/90"> &amp; patents.</span>
              </h2>
              <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-white/40">
                <span className="h-px w-8 bg-white/15" />
                <span>DOSSIER // 2025–26 · VERIFIED RECORDS ONLY · PIET ECE</span>
              </div>
            </div>
            <div className="reveal stagger-2 max-w-[380px] space-y-3">
              <p className="text-[13.5px] leading-relaxed font-mono text-white/60 border-l-2 border-[#FF4A15]/40 pl-4">
                Student breakthroughs in national robotics expos, sovereign patent grants &amp; core silicon careers — documented, stamped, and traceable.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
                <Verified className="w-3.5 h-3.5 text-[#FF4A15]" /> OFFICIAL REGISTRY — PIET AUTONOMOUS
              </div>
            </div>
          </div>

        {/* Milestone Stat Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10 reveal">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-4 sm:p-5 rounded-2xl bg-[#0F0F11] border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-[#FF4A15]/30 transition-colors"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF4A15]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/40 uppercase font-bold">{s.label}</div>
              <div className="font-[Syne] font-[800] text-[22px] sm:text-[26px] text-white tracking-tight mt-1 leading-none group-hover:text-[#FF4A15] transition-colors">
                {s.val}
              </div>
              <div className="text-[10.5px] font-mono text-white/40 mt-1.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-[#0F0F11] border border-white/[0.06] w-fit mb-8 reveal">
          {(['All', 'Competition', 'Patent', 'Academic', 'Placement'] as const).map((cat) => {
            const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FF4A15] text-white font-bold shadow-[0_4px_14px_rgba(255,74,21,0.35)]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {cat} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold ${active ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/60'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Timeline Sheets */}
        <div className="relative ml-0 lg:ml-2">
          <div className="hidden sm:block absolute left-[28px] top-0 bottom-0 w-px bg-gradient-to-b from-[#FF4A15]/40 via-white/[0.08] to-transparent" />
          <div className="space-y-6">
            {filteredItems.map((it, idx) => {
              const Icon = it.Icon;
              return (
                <div
                  key={it.index}
                  onClick={() => {
                    soundFx.playLaser();
                    if (it.action) {
                      setSelectedPatent(true);
                    } else {
                      setSelectedItem(it);
                    }
                  }}
                  className="reveal group relative flex gap-4 sm:gap-6 cursor-pointer"
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  {/* Timeline Node */}
                  <div className="hidden sm:flex flex-col items-center shrink-0 w-[56px]">
                    <span className="w-8 h-8 rounded-full bg-[#0F0F11] border border-white/[0.12] text-white/70 grid place-items-center group-hover:bg-[#FF4A15] group-hover:text-white group-hover:border-[#FF4A15] group-hover:shadow-[0_0_18px_rgba(255,74,21,0.5)] transition-all">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="mt-2 text-[10.5px] font-mono tracking-[0.12em] text-white/30 font-bold">{it.index}</span>
                    <span className="mt-2 w-px flex-1 bg-white/[0.06] group-hover:bg-[#FF4A15]/20 transition-colors hidden lg:block" />
                  </div>

                  {/* Achievement Sheet Card */}
                  <div className="flex-1 relative rounded-[24px] bg-[#0F0F11]/90 backdrop-blur-2xl border border-white/[0.08] overflow-hidden flex flex-col sm:flex-row hover:border-[#FF4A15]/40 hover:shadow-[0_20px_48px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 transition-all duration-400">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#FF4A15]/50 transition-colors" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${it.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                    {/* Left Highlight Stripe */}
                    <div className="hidden sm:block w-1.5 self-stretch bg-white/[0.06] group-hover:bg-[#FF4A15] transition-colors shrink-0" />

                    <div className="relative flex-1 p-5 sm:p-7 flex flex-col gap-3.5 justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono tracking-[0.14em] font-bold px-3 py-1 rounded-full bg-[#FF4A15]/15 border border-[#FF4A15]/30 text-[#FF4A15]">
                            {it.type}
                          </span>
                          <span className="text-[10px] font-mono tracking-[0.08em] text-white/40">{it.dossier}</span>
                          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50">
                            <Layers className="w-3 h-3 text-[#FF4A15]" /> SHEET {it.index}
                          </span>
                        </div>

                        <h3 className="font-[Syne] font-[800] leading-[1.15] tracking-[-0.02em] text-[19px] sm:text-[21px] text-[#F5F3EF] mt-2 group-hover:text-white transition-colors pr-16 sm:pr-24">
                          {it.title}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]" /> {it.team}
                        </div>
                        <p className="text-[13px] leading-relaxed text-white/60 max-w-[700px] mt-2">{it.desc}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                        <span className="inline-flex text-[11.5px] font-mono font-black px-3.5 py-1.5 rounded-full bg-[#FF4A15] text-white shadow-[0_6px_16px_rgba(255,74,21,0.35)]">
                          {it.metric}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF4A15] group-hover:translate-x-0.5 transition-transform">
                          VIEW DOSSIER <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Stamp Watermark */}
                    <div className="hidden sm:grid absolute top-5 right-5 rotate-[-8deg] w-24 h-24 rounded-full border-2 border-[#FF4A15]/40 text-[#FF4A15]/40 place-items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10.5px] font-mono font-black tracking-[0.14em] text-center px-1">
                        {it.stamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <div className="reveal mt-10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/40 border-t border-white/[0.06] pt-4">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF88]" /> All records cross-verified with institute registry &amp; IP India.
          </span>
          <span className="text-white/30">Official Patent Registration: IN 492026</span>
        </div>
      </div>
      </div>

      {/* Patent Dossier Lightbox — Rendered via createPortal */}
      {selectedPatent && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#08080A]/90 backdrop-blur-[24px] animate-in fade-in duration-200"
          onClick={() => setSelectedPatent(false)}
        >
          <div
            className="relative w-full max-w-[580px] rounded-[28px] overflow-hidden bg-[#0F0F11] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent" />

            <div className="relative flex items-start justify-between gap-4 px-7 sm:px-8 pt-7 pb-5 border-b border-white/[0.08] bg-[rgba(255,74,21,0.05)]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10.5px] font-mono tracking-[0.14em] font-bold text-[#FF4A15]">
                  <ShieldCheck className="w-4 h-4" /> OFFICIAL PATENT DOSSIER — GOVT OF INDIA
                </div>
                <h3 className="font-[Syne] font-[800] tracking-[-0.03em] leading-tight text-[24px] sm:text-[26px] text-white">
                  Low-Power Edge IoT Mesh
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex text-[11px] font-mono font-black tracking-[0.08em] px-3 py-1 rounded-full bg-[#FF4A15] text-white shadow-[0_6px_16px_rgba(255,74,21,0.35)]">
                    PATENT No. 492026 · IN
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.10em] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> GRANTED &amp; PUBLISHED
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatent(false)}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.1] text-white grid place-items-center hover:bg-white hover:text-black transition-all shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative p-7 sm:p-8 space-y-5">
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[rgba(8,8,10,0.9)]">
                <div className="grid grid-cols-1 divide-y divide-white/[0.06] text-[12px] font-mono">
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-white/40 tracking-[0.08em] text-[10px] font-bold">TITLE</span>
                    <span className="font-semibold text-[#F5F3EF] text-right">Low-Power Edge IoT Mesh Node</span>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-3 bg-white/[0.02]">
                    <span className="text-white/40 tracking-[0.08em] text-[10px] font-bold">ASSIGNEE</span>
                    <span className="font-semibold text-[#F5F3EF] text-right">ECE Research Cell &amp; Forum — PIET</span>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-white/40 tracking-[0.08em] text-[10px] font-bold">JURISDICTION</span>
                    <span className="font-semibold text-[#FF4A15] text-right">Govt of India — Intellectual Property</span>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-3 bg-white/[0.02]">
                    <span className="text-white/40 tracking-[0.08em] text-[10px] font-bold">FILING → GRANT</span>
                    <span className="font-semibold text-white/80 text-right">Application → 492026 · Published</span>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-white/40 tracking-[0.08em] text-[10px] font-bold">DOMAIN</span>
                    <span className="font-semibold text-white/80 text-right">Sub-GHz LoRaWAN · Ultra-low-power</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.14)] p-4 flex items-start gap-3">
                <FileCheck2 className="w-4 h-4 text-[#FF4A15] shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed font-mono text-white/70">
                  Ultra-low power LoRaWAN mesh communication node filed by students &amp; faculty mentors. Full specification on file with Indian Patent Office.
                </p>
              </div>

              <button
                onClick={() => setSelectedPatent(false)}
                className="w-full py-3 rounded-full bg-[#FF4A15] text-white font-mono font-bold text-xs tracking-wide hover:bg-[#FF4A15]/90 transition-all cursor-pointer shadow-lg"
              >
                DISMISS DOSSIER
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* General Achievement Details Modal — Rendered via createPortal */}
      {selectedItem && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#08080A]/90 backdrop-blur-[24px] animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-[560px] rounded-[28px] overflow-hidden bg-[#0F0F11] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent" />

            <div className="relative p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-mono tracking-[0.14em] font-bold px-3 py-1 rounded-full bg-[#FF4A15]/15 border border-[#FF4A15]/30 text-[#FF4A15]">
                  {selectedItem.type}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] text-white grid place-items-center hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-[Syne] font-[800] text-[22px] sm:text-[24px] text-white leading-tight">
                {selectedItem.title}
              </h3>
              <div className="text-xs font-mono text-white/50">{selectedItem.team}</div>

              <p className="text-[13.5px] leading-relaxed text-white/70">{selectedItem.desc}</p>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-white/60 leading-relaxed">
                {selectedItem.fullDetails}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] font-mono font-bold px-3.5 py-1.5 rounded-full bg-[#FF4A15] text-white">
                  {selectedItem.metric}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
