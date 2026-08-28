import React from 'react';
import { Compass, ArrowUpRight, Check, Cpu } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const AboutSection: React.FC = () => {
  const revealRef = useScrollReveal(0.08);
  return (
    <section id="about" ref={revealRef} className="relative bg-[#08080A] text-[#F5F3EF] overflow-hidden border-t border-white/[0.06]">
      {/* quiet backdrop — single grid, soft blob */}
      <div className="absolute inset-0 editorial-grid opacity-[0.03] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[520px] h-[520px] top-[8%] -left-[90px] opacity-[0.12]" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-20 lg:py-28">
        {/* Header — airy, no ledger border */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12 mb-14 lg:mb-16">
          <div className="reveal max-w-[620px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3.5 py-1.5 backdrop-blur">
              <span className="w-5 h-5 rounded-full bg-[#F5F3EF] text-[#08080A] grid place-items-center"><Compass className="w-3 h-3" /></span>
              <span className="text-[11px] font-mono tracking-[0.14em] font-bold text-white/80">01 — THE ATELIER</span>
            </div>
            <h2 className="mt-5 font-[Syne] font-[800] tracking-[-0.05em] leading-[0.90] text-[36px] sm:text-[46px] lg:text-[52px]">
              Two councils.
              <br />
              <span className="font-['Instrument_Serif'] font-normal italic tracking-[-0.02em] text-[#FF4A15]">One engineering culture.</span>
            </h2>
          </div>
          <p className="reveal stagger-2 max-w-[400px] text-[14.5px] leading-[1.75] text-white/50 lg:text-right">
            SPACE drives research &amp; IEEE symposiums. SINC ships hardware — rovers, RISC-V cores, LoRa mesh.
            <span className="text-white/80"> Together they form the department&apos;s operating system for 2026—27.</span>
          </p>
        </div>

        {/* Split — smaller figure + breathing spec cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left — compact patent figure, less grid noise */}
          <div className="lg:col-span-4 lg:sticky lg:top-[96px] reveal">
            <div className="relative rounded-[22px] bg-[#0F0F11] border border-white/[0.07] p-4 overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.12em] text-white/25 px-1 pb-3">
                <span>FIG. 02 — ATELIER</span>
                <span className="inline-flex items-center gap-1 text-white/35"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" /> VERIFIED</span>
              </div>

              <div className="relative rounded-[16px] bg-[#060608] border border-white/[0.05] aspect-[4/3.1] grid place-items-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(480px_circle_at_50%_0%,rgba(255,74,21,0.06),transparent_60%)]" />
                <div className="relative flex items-center gap-6 sm:gap-7">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-[84px] h-[84px] sm:w-[88px] sm:h-[88px] rounded-2xl bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_10px_28px_rgba(245,243,239,0.10)]">
                      <img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.14em] font-bold text-white">SPACE — 2012</span>
                    <span className="text-[10px] font-mono tracking-[0.08em] text-white/30">RESEARCH · IEEE</span>
                  </div>
                  <span className="text-white/15 font-mono text-lg">×</span>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-[84px] h-[84px] sm:w-[88px] sm:h-[88px] rounded-2xl bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_10px_28px_rgba(245,243,239,0.12)] border border-white">
                      <img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" style={{ filter: 'brightness(0.15)' }} />
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.14em] font-bold text-white">SINC — 2018</span>
                    <span className="text-[10px] font-mono tracking-[0.08em] text-white/30">HARDWARE · PATENT</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-1 text-center divide-x divide-white/[0.06] border-t border-white/[0.06] pt-4">
                {[
                  { k: '1,500+', l: 'Engineers' },
                  { k: '80+', l: 'Symposia' },
                  { k: '120+', l: 'Prototypes' },
                ].map((s) => (
                  <div key={s.k} className="flex-1 px-2">
                    <div className="font-[Syne] font-[800] text-[16px] leading-none tracking-[-0.02em] text-white">{s.k}</div>
                    <div className="text-[10px] font-mono tracking-[0.08em] text-white/35 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[10px] font-mono tracking-[0.12em] text-white/20 px-1">PLATE ATELIER-01 — 21.14°N 79.08°E — FOLD LINE</p>
          </div>

          {/* Right — simple cards, clear hierarchy, no ledger tables */}
          <div className="lg:col-span-8 space-y-5 reveal stagger-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SPACE */}
              <div className="group relative rounded-[20px] bg-white/[0.035] border border-white/[0.07] p-6 sm:p-7 backdrop-blur-xl hover:border-white/[0.10] hover:bg-white/[0.045] transition-colors">
                <div className="text-[10px] font-mono tracking-[0.14em] text-white/30">01 — ESTD 2012</div>
                <h3 className="mt-2 font-[Syne] font-[800] tracking-[-0.03em] text-[20px] leading-none text-white">SPACE</h3>
                <div className="text-[11px] font-mono tracking-[0.06em] text-white/35 mt-1 leading-none">Students&apos; Progressive Association</div>
                <p className="mt-4 text-[13px] leading-[1.65] text-white/55">
                  Research publications, IEEE &amp; IETE chapters, <span className="text-white font-medium">ELEKTRONIKOS</span> magazine and national symposia — the scholarly foundation.
                </p>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/25">FACULTY INCHARGE</div>
                    <div className="mt-1.5 text-[13px] font-medium leading-tight text-white">Dr. Sunita N Parihar</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/25">PRESIDENT</div>
                    <div className="mt-1.5 text-[13px] font-semibold leading-tight text-white">Rohan Virutkar</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {['IEEE Chapter', 'Research Papers', 'TARANG Gala', 'ELEKTRONIKOS'].map((t) => (
                    <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-white/60">{t}</span>
                  ))}
                </div>

                <button onClick={() => { soundFx.playLaser(); document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-medium text-white/70 hover:text-white group/btn">
                  View leadership <span className="w-7 h-7 rounded-full bg-white text-[#08080A] grid place-items-center group-hover/btn:bg-[#FF4A15] group-hover/btn:text-white transition-colors"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </button>
              </div>

              {/* SINC */}
              <div className="group relative rounded-[20px] bg-[#FF4A15]/[0.06] border border-[#FF4A15]/15 p-6 sm:p-7 backdrop-blur-xl hover:border-[#FF4A15]/20 hover:bg-[#FF4A15]/[0.08] transition-colors">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.12em] font-bold text-[#FF4A15]"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]" /> SIGNAL PLATE — 02</div>
                <h3 className="mt-2 font-[Syne] font-[800] tracking-[-0.03em] text-[20px] leading-none text-white">SINC</h3>
                <div className="text-[11px] font-mono tracking-[0.06em] text-white/35 mt-1 leading-none">Student Innovation Council — ESTD 2018</div>
                <p className="mt-4 text-[13px] leading-[1.65] text-white/55">
                  Rovers, robotics arena, patent grants &amp; LoRaWAN mesh — the hardware engine. <span className="text-white">Ship. Test. Patent.</span>
                </p>

                <div className="mt-6 pt-5 border-t border-[#FF4A15]/10 grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/25">FACULTY INCHARGE</div>
                    <div className="mt-1.5 text-[13px] font-medium leading-tight text-white">Ms. V. V. Shirpurkar</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/25">PRESIDENT</div>
                    <div className="mt-1.5 text-[13px] font-semibold leading-tight text-[#FF4A15]">Makarand Bahmane</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {['Hardware Labs', 'Govt Patents', 'Robotics Arena', 'LoRa Mesh'].map((t) => (
                    <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/15 text-[#FF4A15]/90">{t}</span>
                  ))}
                </div>

                <button onClick={() => { soundFx.playLaser(); document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-medium text-white/70 hover:text-white group/btn">
                  <Cpu className="w-3.5 h-3.5 text-[#FF4A15]" /> View wings <span className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center group-hover/btn:shadow-[0_6px_16px_rgba(255,74,21,0.35)] transition-shadow"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </button>
              </div>
            </div>

            {/* Proof — airy inline, not dense */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['IEEE & IETE Top 1%', 'Patent 492026/IN', '₹1L Hackathon Win', '24 LPA Peak', '48+ Papers'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/45">
                  <Check className="w-3 h-3 text-white/25" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
