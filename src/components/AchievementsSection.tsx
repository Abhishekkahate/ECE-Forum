import React, { useState } from 'react';
import { Trophy, Award, FileCheck2, Briefcase, ExternalLink, X, ShieldCheck, Stamp, Layers, Verified } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const AchievementsSection: React.FC = () => {
  const [selectedPatent, setSelectedPatent] = useState(false);
  const revealRef = useScrollReveal(0.08);

  const items = [
    {
      index: '01',
      type: 'NATIONAL CHAMPION',
      title: '1st Prize — National Smart Hardware Expo',
      team: 'Autonomous Rover Wing · SINC',
      desc: 'LiDAR search & rescue rover built on custom RISC-V SoC — 1st place among 120+ national engineering colleges.',
      metric: '₹1,00,000',
      Icon: Trophy,
      color: 'from-[#FF4A15]/[0.10] to-transparent',
      stamp: 'VERIFIED',
      dossier: 'DOSSIER / EXPO-NHE-2025',
    },
    {
      index: '02',
      type: 'PATENT GRANTED',
      title: 'Govt Patent: Low-Power Edge IoT Mesh',
      team: 'ECE Research Cell & SPACE',
      desc: 'Ultra-low power LoRaWAN mesh communication node — Indian patent granted by Govt of India.',
      metric: 'IN 492026',
      Icon: FileCheck2,
      action: true,
      color: 'from-[#FF4A15]/[0.14] to-[#FF7A45]/[0.06]',
      stamp: 'GRANTED',
      dossier: 'DOSSIER / PAT-IN-492026',
    },
    {
      index: '03',
      type: 'INSTITUTIONAL HONOUR',
      title: 'Outstanding Student Chapter Excellence',
      team: 'Executive Council · SPACE',
      desc: 'IEEE & IETE regional excellence award for conducting 45+ hands-on workshops, conferences & student publications.',
      metric: 'Top 1%',
      Icon: Award,
      color: 'from-[#FF4A15]/[0.08] to-transparent',
      stamp: 'HONOURED',
      dossier: 'DOSSIER / IEEE-IETE-2025',
    },
    {
      index: '04',
      type: 'CAREER MILESTONE',
      title: 'Tier-1 Silicon Semiconductor Placements',
      team: 'Placement & Industry Cell',
      desc: 'Core placements in Texas Instruments, Qualcomm, Intel, Cadence, Synopsys and NXP Semiconductors.',
      metric: '24 LPA peak',
      Icon: Briefcase,
      color: 'from-[#FF4A15]/[0.09] to-transparent',
      stamp: 'PLACED',
      dossier: 'DOSSIER / PLACEMENT-2025',
    },
  ];

  return (
    <section id="achievements" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden">
      {/* blueprint + editorial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 editorial-grid opacity-[0.07]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.10) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        {/* signal vignette */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-[90px] opacity-[0.08] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, #FF4A15 0%, transparent 70%)' }} />
      </div>
      <div className="section-divider-subtle absolute top-0 left-0 right-0" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/25 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* header — editorial dossier */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="reveal max-w-[640px]">
            <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(255,74,21,0.08)] border border-[rgba(255,74,21,0.18)] px-3.5 py-1.5 backdrop-blur-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.7)] animate-pulse" />
              <span className="text-[10.5px] font-mono tracking-[0.16em] font-bold text-[#FF4A15]">04 — PRESTIGE & HONOURS</span>
              <span className="hidden sm:inline-flex text-[9px] font-mono tracking-[0.10em] px-2 py-0.5 rounded-full bg-[#08080A] border border-white/10 text-white/60">SHEET 04 / ATELIER ARCHIVE</span>
            </div>
            <h2 className="mt-5 font-display font-[800] tracking-[-0.05em] leading-[0.88] text-[32px] sm:text-[42px] lg:text-[52px] text-[#F5F3EF]">
              Verified <span className="font-serif italic font-[400] tracking-[-0.04em] text-[#FF4A15]">victories</span>
              <span className="block text-white/90"> &amp; honours.</span>
            </h2>
            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-white/35">
              <span className="h-px w-8 bg-white/15" />
              <span>DOSSIER — 2025–26 · VERIFIED RECORDS ONLY · PIET ECE</span>
            </div>
          </div>
          <div className="reveal stagger-2 max-w-[360px] space-y-3">
            <p className="text-[13px] leading-relaxed font-mono text-white/55 border-l-2 border-[#FF4A15]/30 pl-4">
              Student breakthroughs in national competitions, patent grants &amp; silicon careers — documented, stamped and verifiable. Every sheet is traceable.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
              <Verified className="w-3.5 h-3.5 text-[#FF4A15]" /> ATELIER REGISTRY — AUDITED 2026
            </div>
          </div>
        </div>

        {/* TIMELINE — vertical dossier review, not grid */}
        <div className="relative ml-0 lg:ml-2">
          {/* vertical spine */}
          <div className="hidden sm:block absolute left-[28px] top-0 bottom-0 w-px bg-gradient-to-b from-[#FF4A15]/40 via-white/[0.08] to-transparent" />
          <div className="space-y-6">
            {items.map((it, idx) => {
              const Icon = it.Icon;
              return (
                <div
                  key={it.index}
                  onClick={() => { if (it.action) { soundFx.playLaser(); setSelectedPatent(true); } }}
                  className={`reveal group relative flex gap-4 sm:gap-6 ${it.action ? 'cursor-pointer' : ''}`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  {/* timeline node */}
                  <div className="hidden sm:flex flex-col items-center shrink-0 w-[56px]">
                    <span className="w-7 h-7 rounded-full bg-[#0F0F11] border border-white/[0.10] text-white/60 grid place-items-center group-hover:bg-[#FF4A15] group-hover:text-white group-hover:border-[#FF4A15] group-hover:shadow-[0_0_14px_rgba(255,74,21,0.45)] transition-all">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="mt-2 text-[10px] font-mono tracking-[0.12em] text-white/25">{it.index}</span>
                    <span className="mt-2 w-px flex-1 bg-white/[0.06] group-hover:bg-[#FF4A15]/20 transition-colors hidden lg:block" />
                  </div>
                  {/* sheet */}
                  <div className={`flex-1 relative rounded-[22px] bg-[rgba(16,16,18,0.78)] backdrop-blur-2xl border overflow-hidden flex flex-col sm:flex-row ${it.action ? 'border-white/[0.08] hover:border-[#FF4A15]/30 hover:shadow-[0_18px_40px_rgba(0,0,0,0.5)]' : 'border-white/[0.08]' } transition-all duration-500`}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#FF4A15]/35 transition-colors" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${it.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                    {/* left stripe */}
                    <div className="hidden sm:block w-[3px] self-stretch bg-white/[0.06] group-hover:bg-[#FF4A15] transition-colors shrink-0" />
                    <div className="relative flex-1 p-5 sm:p-6 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono tracking-[0.14em] font-bold px-2.5 py-1 rounded-full bg-[#FF4A15]/15 border border-[#FF4A15]/20 text-[#FF4A15]">{it.type}</span>
                        <span className="text-[10px] font-mono tracking-[0.08em] text-white/30">{it.dossier}</span>
                        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40"><Layers className="w-3 h-3" /> SHEET {it.index}</span>
                      </div>
                      <h3 className="font-[Syne] font-[800] leading-[1.1] tracking-[-0.02em] text-[18px] sm:text-[19px] text-[#F5F3EF] pr-16 sm:pr-20">{it.title}</h3>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40"><span className="w-1 h-1 rounded-full bg-[#FF4A15]" /> {it.team}</div>
                      <p className="text-[13px] leading-relaxed text-white/55 max-w-[680px]">{it.desc}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <span className="inline-flex text-[11px] font-mono font-black px-3 py-1 rounded-full bg-[#FF4A15] text-white shadow-[0_6px_16px_rgba(255,74,21,0.35)]">{it.metric}</span>
                        {it.action ? <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#FF4A15]">VIEW DOSSIER <ExternalLink className="w-3.5 h-3.5" /></span> : <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> VERIFIED</span>}
                      </div>
                    </div>
                    {/* stamp */}
                    <div className="hidden sm:grid absolute top-4 right-4 rotate-[-8deg] w-20 h-20 rounded-full border-[1.5px] border-[#FF4A15]/40 text-[#FF4A15]/30 place-items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono font-black tracking-[0.14em]">{it.stamp}</span>
                    </div>
                    <div className="sm:hidden absolute top-3 right-3 rotate-[-8deg] text-[10px] font-mono font-black tracking-[0.14em] px-2.5 py-1 rounded-full border border-[#FF4A15] text-[#FF4A15] bg-[rgba(255,74,21,0.08)]">{it.stamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* footnote mono */}
        <div className="reveal mt-8 flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/30">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF4A15]" /> All records cross-verified with institute registry &amp; IP India.
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
          <span className="text-white/20">Patent dossier available on request — IN 492026</span>
        </div>
      </div>

      {/* Patent Dossier — technical sheet lightbox */}
      {selectedPatent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#08080A]/85 backdrop-blur-[14px]"
          onClick={() => setSelectedPatent(false)}
        >
          <div
            className="relative w-full max-w-[560px] rounded-[28px] overflow-hidden bg-[#0F0F11] border border-white/[0.10] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* blueprint grid inside */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.18) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/40 to-transparent" />

            {/* header */}
            <div className="relative flex items-start justify-between gap-4 px-7 sm:px-8 pt-7 pb-5 border-b border-white/[0.08] bg-[rgba(255,74,21,0.04)]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] font-bold text-[#FF4A15]">
                  <ShieldCheck className="w-4 h-4" /> OFFICIAL PATENT DOSSIER — GOVT OF INDIA
                </div>
                <h3 className="font-display font-[800] tracking-[-0.03em] leading-none text-[24px] sm:text-[26px] text-[#F5F3EF]">Low-Power Edge IoT Mesh</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex text-[11px] font-mono font-black tracking-[0.08em] px-3 py-1 rounded-full bg-[#FF4A15] text-white shadow-[0_6px_16px_rgba(255,74,21,0.35)]">
                    PATENT No. 492026 · IN
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.10em] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GRANTED & PUBLISHED
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatent(false)}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] text-white grid place-items-center hover:bg-white hover:text-black hover:border-white transition-all shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* stamp */}
            <div className="absolute top-[74px] right-8 rotate-[-12deg] hidden sm:flex pointer-events-none">
              <div className="text-[12px] font-mono font-black tracking-[0.18em] px-4 py-1.5 rounded-lg border-2 border-[#FF4A15] text-[#FF4A15] bg-[rgba(255,74,21,0.06)] shadow-[0_0_18px_rgba(255,74,21,0.22)]">
                GRANTED — IP INDIA
              </div>
            </div>

            {/* details table — mono */}
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

              <div className="rounded-xl bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.14)] px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center shrink-0 mt-0.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-[12px] leading-relaxed font-mono text-white/70">
                  On file with the institute registry. Full specification and claims available via institutional liaison. This dossier card is a summary extract only.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPatent(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF4A15] text-white font-mono font-bold tracking-[0.06em] text-[12px] py-3 hover:bg-[#E63E0F] hover:shadow-[0_8px_22px_rgba(255,74,21,0.35)] transition-all"
                >
                  CLOSE DOSSIER
                </button>
                <a
                  href="#achievements"
                  onClick={(e) => { e.preventDefault(); setSelectedPatent(false); }}
                  className="px-6 rounded-full bg-white/[0.06] border border-white/[0.10] text-white font-mono font-bold text-[12px] inline-flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                >
                  ARCHIVE
                </a>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono tracking-[0.12em] text-white/25 pt-2 border-t border-white/[0.06]">
                <span>SHEET 02 / 04 — PAT-IN-492026 — ATELIER No.08</span>
                <span>VERIFIED 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
