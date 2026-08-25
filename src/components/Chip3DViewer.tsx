import React, { useState, useEffect, useRef } from 'react';
import { Radio, Activity, RefreshCw, Cpu } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const Chip3DViewer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'ai' | 'dsp' | 'rf'>('ai');
  const [isFlipped, setIsFlipped] = useState(false);
  const [shockwave, setShockwave] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Smooth lerp 3D parallax without triggering React re-renders on mousemove
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetX = -y * 0.08;
      targetY = x * 0.08;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    const updateTilt = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateZ(0)`;
      }

      animId = requestAnimationFrame(updateTilt);
    };

    animId = requestAnimationFrame(updateTilt);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animId);
    };
  }, []);

  // Auto flip every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playLaser();
    setIsFlipped((prev) => !prev);
  };

  const handleCoreClick = () => {
    soundFx.playPowerUp();
    setShockwave(true);
    setTimeout(() => setShockwave(false), 800);
  };

  const handleModeChange = (mode: 'ai' | 'dsp' | 'rf') => {
    soundFx.playClick();
    setActiveMode(mode);
  };

  // Telemetry metadata for modes
  const modeData = {
    ai: {
      color: '#00F2FE',
      label: 'RISC-V 32-BIT AI CORE',
      clock: '450.00 MHz',
      volt: '1.20 V',
      temp: '37.4 °C',
      tag: 'TINYML ENGINE'
    },
    dsp: {
      color: '#FFB800',
      label: 'FPGA DSP ARITHMETIC',
      clock: '600.00 MHz',
      volt: '1.80 V',
      temp: '42.1 °C',
      tag: 'HDL PIPELINE'
    },
    rf: {
      color: '#A855F7',
      label: 'SUB-GHZ LoRa MESH ARRAY',
      clock: '868.10 MHz',
      volt: '3.30 V',
      temp: '34.8 °C',
      tag: 'PATENTED GRID'
    }
  };

  const curMode = modeData[activeMode];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md lg:max-w-lg aspect-square flex items-center justify-center cursor-pointer select-none group perspective-1000"
      onClick={handleCoreClick}
    >
      {/* Dynamic Ambient Volumetric Aura */}
      <div 
        className="absolute inset-0 rounded-full blur-[100px] opacity-60 group-hover:opacity-90 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${curMode.color}33 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%)`
        }}
      />

      {/* 3D Orbiting Quantum Electron Halos */}
      <div className="absolute w-[94%] h-[94%] rounded-full border border-dashed pointer-events-none animate-spin-slow" style={{ borderColor: `${curMode.color}40` }}>
        {/* Electron Point */}
        <div 
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-lg"
          style={{ backgroundColor: curMode.color, boxShadow: `0 0 12px ${curMode.color}` }}
        />
      </div>

      <div className="absolute w-[108%] h-[108%] rounded-full border border-dotted border-cyber-purple/30 pointer-events-none animate-spin-slow [animation-direction:reverse]">
        <div 
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_10px_#FFB800]"
        />
      </div>

      {/* Shockwave Pulse Effect on Click */}
      {shockwave && (
        <div 
          className="absolute w-full h-full rounded-full border-2 animate-ping pointer-events-none"
          style={{ borderColor: curMode.color }}
        />
      )}

      {/* ── Main 3D Interactive Silicon Chassis ───────────────── */}
      <div
        ref={cardRef}
        className="relative w-[320px] h-[320px] sm:w-[390px] sm:h-[390px] rounded-3xl bg-gradient-to-b from-[#0C1226]/95 via-[#070A18]/98 to-[#03050E] border border-white/15 p-6 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(0,242,254,0.25)] flex flex-col justify-between backdrop-blur-xl preserve-3d will-change-transform"
        style={{
          transform: 'rotateX(0deg) rotateY(0deg) translateZ(0)',
        }}
      >
        {/* PCB Gold Corner Mounting Pads */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full border-2 border-amber/80 bg-midnight-deep shadow-[0_0_8px_rgba(255,184,0,0.6)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-amber" />
        </div>
        <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full border-2 border-lime/80 bg-midnight-deep shadow-[0_0_8px_rgba(0,242,254,0.6)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-lime" />
        </div>
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full border-2 border-lime/80 bg-midnight-deep shadow-[0_0_8px_rgba(0,242,254,0.6)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-lime" />
        </div>
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full border-2 border-amber/80 bg-midnight-deep shadow-[0_0_8px_rgba(255,184,0,0.6)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-amber" />
        </div>

        {/* Top Header Telemetry & Quick Flip */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: curMode.color }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-md" style={{ backgroundColor: curMode.color }}></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest font-bold" style={{ color: curMode.color }}>
              {curMode.tag}
            </span>
          </div>

          <button
            onClick={handleManualFlip}
            title="Click to flip Council Badge"
            className="flex items-center space-x-1.5 bg-midnight-deep/90 px-3 py-1 rounded-full border border-white/15 text-[10px] font-mono text-slate-300 hover:text-white hover:border-white/30 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180 text-lime' : 'text-amber'} transition-transform duration-700`} />
            <span className="font-bold">{isFlipped ? 'SINC COUNCIL' : 'SPACE FORUM'}</span>
          </button>
        </div>

        {/* ── Center Silicon Die with Dual 3D Flipping Badges ──── */}
        <div className="relative my-auto flex items-center justify-center">
          {/* Peripheral Gold Solder Pin Array Simulation */}
          <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border border-dashed border-white/15 pointer-events-none flex items-center justify-center">
            {/* Top & Bottom Pin Ticks */}
            <div className="absolute -top-1.5 flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              ))}
            </div>
            <div className="absolute -bottom-1.5 flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
              ))}
            </div>
          </div>

          {/* 3D Core Card Container */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 perspective-1000">
            <div
              className="w-full h-full relative transition-transform duration-700 preserve-3d"
              style={{
                transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
              }}
            >
              {/* FRONT: SPACE FORUM HOLOGRAPHIC BADGE */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#141B2E] via-[#0A1022] to-[#04060E] border-2 border-amber/70 shadow-[0_0_35px_rgba(255,184,0,0.35)] flex flex-col items-center justify-center p-3.5 overflow-hidden [backface-visibility:hidden]">
                {/* Circuit Grid Background */}
                <div className="absolute inset-0 circuit-grid-pattern opacity-40" />

                {/* Laser scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/15 to-transparent animate-scan-line pointer-events-none" />

                <div className="z-10 flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 p-1.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.35)]">
                    <img
                      src="/space_logo.webp"
                      alt="SPACE Forum"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,184,0,0.75)]"
                    />
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-space font-extrabold tracking-widest text-amber">
                      SPACE FORUM
                    </span>
                    <span className="block text-[8px] sm:text-[9px] font-mono text-slate-300 uppercase tracking-wider">
                      STUDENT'S PROGRESSIVE ASSOC.
                    </span>
                  </div>
                </div>

                {/* Top/Bottom Laser Glows */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
              </div>

              {/* BACK: SINC COUNCIL HOLOGRAPHIC BADGE */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#0D162C] via-[#060E22] to-[#030612] border-2 border-lime/70 shadow-[0_0_35px_rgba(0,242,254,0.4)] flex flex-col items-center justify-center p-3.5 overflow-hidden [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                {/* Circuit Grid Background */}
                <div className="absolute inset-0 circuit-grid-pattern opacity-40" />

                {/* Laser scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent animate-scan-line pointer-events-none" />

                <div className="z-10 flex flex-col items-center text-center space-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 p-1.5 rounded-2xl bg-lime/10 border border-lime/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.45)]">
                    <img
                      src="/sinc_logo.webp"
                      alt="SINC Council"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,242,254,0.85)]"
                    />
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-space font-extrabold tracking-widest text-lime">
                      SINC COUNCIL
                    </span>
                    <span className="block text-[8px] sm:text-[9px] font-mono text-slate-300 uppercase tracking-wider">
                      STUDENT INNOVATION COUNCIL
                    </span>
                  </div>
                </div>

                {/* Top/Bottom Laser Glows */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Silicon Telemetry HUD & Mode Switcher ──── */}
        <div className="space-y-2.5 z-10 border-t border-white/10 pt-3">
          
          {/* Micro Telemetry Bar */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>CLK: <strong className="text-white">{curMode.clock}</strong></span>
            <span>•</span>
            <span>CORE: <strong className="text-white">{curMode.volt}</strong></span>
            <span>•</span>
            <span>TEMP: <strong className="text-cyber-emerald font-bold">{curMode.temp}</strong></span>
          </div>

          {/* Mode Buttons */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); handleModeChange('ai'); }}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-lg transition-all text-[10px] font-mono cursor-pointer ${
                activeMode === 'ai'
                  ? 'bg-lime/20 text-lime border border-lime/50 shadow-[0_0_10px_rgba(0,242,254,0.3)] font-bold'
                  : 'bg-midnight-deep text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>AI Core</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleModeChange('dsp'); }}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-lg transition-all text-[10px] font-mono cursor-pointer ${
                activeMode === 'dsp'
                  ? 'bg-amber/20 text-amber border border-amber/50 shadow-[0_0_10px_rgba(255,184,0,0.3)] font-bold'
                  : 'bg-midnight-deep text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>FPGA DSP</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleModeChange('rf'); }}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-lg transition-all text-[10px] font-mono cursor-pointer ${
                activeMode === 'rf'
                  ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] font-bold'
                  : 'bg-midnight-deep text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>LoRa Mesh</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
