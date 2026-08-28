import React, { useEffect, useRef } from 'react';
import { Cpu, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const Chip3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  // Optimized lerp tilt — RAF only, pauses when off-screen or prefers-reduced-motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return; // no tilt on mobile for perf

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let ticking = false;
    let visible = true;

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.1 });
    if (containerRef.current) io.observe(containerRef.current);

    const onMove = (e: MouseEvent) => {
      if (!visible || !containerRef.current || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        tx = (-y * 0.05);
        ty = (x * 0.05);
        ticking = false;
      });
    };
    const onLeave = () => { tx = 0; ty = 0; };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', onLeave, { passive: true });
    }

    const loop = () => {
      if (visible) {
        cx += (tx - cx) * 0.07;
        cy += (ty - cy) * 0.07;
        if (cardRef.current) {
          cardRef.current.style.transform = `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg) translateZ(0)`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      if (el) {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-[1.08] max-w-[420px] mx-auto flex items-center justify-center select-none group">
      {/* soft aura — reduced blur + opacity for perf */}
      <div className="absolute inset-0 rounded-[32px] blur-[60px] opacity-30 group-hover:opacity-45 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,74,21,0.18), transparent 62%)' }} />

      {/* card — no will-change by default, only on hover via group */}
      <div
        ref={cardRef}
        className="relative w-full rounded-[28px] bg-[rgba(14,14,16,0.92)] border border-white/[0.08] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] group-hover:[will-change:transform]"
        style={{ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)' }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/28 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.14em] font-bold text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] shadow-[0_0_8px_rgba(255,74,21,0.6)] animate-pulse" /> DUAL ATELIER CORE
          </span>
          <span className="text-[10px] font-mono tracking-[0.08em] text-white/25">FIG. 01 — 1:1 — VERIFIED</span>
        </div>

        {/* dual sigil — both logos visible together */}
        <div className="px-5 py-6">
          <div className="relative grid grid-cols-2 gap-0 rounded-[18px] overflow-hidden border border-white/[0.08] bg-[#050507]">
            {/* subtle grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
            {/* divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FF4A15]/30 to-transparent hidden sm:block" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0A0A0C] border border-white/10 grid place-items-center text-[9px] font-mono font-bold text-white/30 hidden sm:grid">×</div>

            {/* SPACE */}
            <div className="relative flex flex-col items-center text-center gap-3 py-7 px-4 bg-[radial-gradient(ellipse_at_top,_rgba(245,243,239,0.06),_transparent_62%)]">
              <div className="w-[84px] h-[84px] rounded-[18px] bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_8px_24px_rgba(245,243,239,0.18)] border border-white">
                <img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" loading="eager" decoding="async" />
              </div>
              <div>
                <div className="font-[Syne] font-[800] tracking-[-0.02em] text-[13px] text-[#F5F3EF]">SPACE</div>
                <div className="text-[10px] font-mono tracking-[0.08em] text-white/35 leading-none mt-0.5">2012 · RESEARCH</div>
                <div className="mt-1.5 inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/60">IEEE · ELEKTRONIKOS</div>
              </div>
            </div>

            {/* SINC — white bg, dark logo */}
            <div className="relative flex flex-col items-center text-center gap-3 py-7 px-4 bg-[radial-gradient(ellipse_at_top,_rgba(245,243,239,0.06),_transparent_62%)]">
              <div className="w-[84px] h-[84px] rounded-[18px] bg-[#F5F3EF] p-3 grid place-items-center shadow-[0_8px_24px_rgba(245,243,239,0.18)] border border-white">
                <img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" loading="eager" decoding="async" style={{ filter: 'brightness(0.15)' }} />
              </div>
              <div>
                <div className="font-[Syne] font-[800] tracking-[-0.02em] text-[13px] text-[#F5F3EF]">SINC</div>
                <div className="text-[10px] font-mono tracking-[0.08em] text-white/35 leading-none mt-0.5">2018 · HARDWARE</div>
                <div className="mt-1.5 inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/60">PATENT · ROVER</div>
              </div>
            </div>
          </div>

          {/* bottom telemetry — single line, no state */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] border border-white/[0.06] rounded-full overflow-hidden bg-[rgba(8,8,10,0.6)] text-center">
            <div className="px-2 py-2"><div className="text-[9px] font-mono tracking-[0.12em] text-white/30">CORES</div><div className="text-[11px] font-mono font-bold text-[#F5F3EF] leading-none mt-1 flex items-center justify-center gap-1"><Cpu className="w-3 h-3 text-[#FF4A15]" /> RISC-V ×2</div></div>
            <div className="px-2 py-2"><div className="text-[9px] font-mono tracking-[0.12em] text-white/30">FABRIC</div><div className="text-[11px] font-mono font-bold text-white leading-none mt-1">Artix-7 · 450 MHz</div></div>
            <div className="px-2 py-2"><div className="text-[9px] font-mono tracking-[0.12em] text-white/30">LINK</div><div className="text-[11px] font-mono font-bold text-[#00E5CC] leading-none mt-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> LoRa MESH</div></div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-white/[0.02] text-[10px] font-mono tracking-[0.08em]">
          <span className="text-white/30">ATELIER No.08 — SPACE × SINC — 2026—27</span>
          <button onClick={() => soundFx.playClick()} className="hidden sm:inline-flex items-center gap-1 text-white/40 hover:text-[#FF4A15] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse" /> LIVE
          </button>
        </div>
      </div>
    </div>
  );
};
