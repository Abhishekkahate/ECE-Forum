import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Activity, Zap, Sliders, Volume2, VolumeX, Sparkles, 
  Orbit, PenTool, Type, Radio, Terminal
} from 'lucide-react';
import { soundFx } from '../utils/audio';

// High-precision vector stroke paths for full alphanumeric charset
const VECTOR_ALPHABET: Record<string, [number, number][][]> = {
  'E': [
    [[1, 0.05], [0.08, 0.05], [0.08, 0.95], [1, 0.95]],
    [[0.08, 0.5], [0.75, 0.5]]
  ],
  'C': [
    [[0.95, 0.15], [0.65, 0.05], [0.2, 0.15], [0.05, 0.5], [0.2, 0.85], [0.65, 0.95], [0.95, 0.85]]
  ],
  'D': [
    [[0.08, 0.95], [0.08, 0.05], [0.55, 0.05], [0.92, 0.25], [0.92, 0.75], [0.55, 0.95], [0.08, 0.95]]
  ],
  'P': [
    [[0.08, 0.95], [0.08, 0.05], [0.7, 0.05], [0.92, 0.25], [0.7, 0.5], [0.08, 0.5]]
  ],
  'A': [
    [[0.05, 0.95], [0.5, 0.05], [0.95, 0.95]],
    [[0.22, 0.62], [0.78, 0.62]]
  ],
  'R': [
    [[0.08, 0.95], [0.08, 0.05], [0.7, 0.05], [0.92, 0.25], [0.7, 0.5], [0.08, 0.5]],
    [[0.55, 0.5], [0.92, 0.95]]
  ],
  'T': [
    [[0.05, 0.05], [0.95, 0.05]],
    [[0.5, 0.05], [0.5, 0.95]]
  ],
  'M': [
    [[0.08, 0.95], [0.08, 0.05], [0.5, 0.58], [0.92, 0.05], [0.92, 0.95]]
  ],
  'N': [
    [[0.08, 0.95], [0.08, 0.05], [0.92, 0.95], [0.92, 0.05]]
  ],
  'S': [
    [[0.9, 0.18], [0.65, 0.05], [0.25, 0.15], [0.15, 0.35], [0.5, 0.5], [0.85, 0.65], [0.8, 0.85], [0.5, 0.95], [0.15, 0.85]]
  ],
  'O': [
    [[0.5, 0.05], [0.85, 0.18], [0.95, 0.5], [0.85, 0.82], [0.5, 0.95], [0.15, 0.82], [0.05, 0.5], [0.15, 0.18], [0.5, 0.05]]
  ],
  'U': [
    [[0.1, 0.05], [0.1, 0.75], [0.25, 0.95], [0.75, 0.95], [0.9, 0.75], [0.9, 0.05]]
  ],
  'F': [
    [[0.08, 0.95], [0.08, 0.05], [0.92, 0.05]],
    [[0.08, 0.48], [0.7, 0.48]]
  ],
  'I': [
    [[0.15, 0.05], [0.85, 0.05]],
    [[0.5, 0.05], [0.5, 0.95]],
    [[0.15, 0.95], [0.85, 0.95]]
  ],
  'L': [
    [[0.1, 0.05], [0.1, 0.95], [0.9, 0.95]]
  ],
  'B': [
    [[0.08, 0.95], [0.08, 0.05], [0.65, 0.05], [0.88, 0.25], [0.65, 0.5], [0.08, 0.5]],
    [[0.65, 0.5], [0.92, 0.75], [0.65, 0.95], [0.08, 0.95]]
  ],
  'V': [
    [[0.05, 0.05], [0.5, 0.95], [0.95, 0.05]]
  ],
  'W': [
    [[0.05, 0.05], [0.25, 0.95], [0.5, 0.35], [0.75, 0.95], [0.95, 0.05]]
  ],
  'X': [
    [[0.1, 0.05], [0.9, 0.95]],
    [[0.9, 0.05], [0.1, 0.95]]
  ],
  'Y': [
    [[0.05, 0.05], [0.5, 0.5], [0.95, 0.05]],
    [[0.5, 0.5], [0.5, 0.95]]
  ],
  'Z': [
    [[0.08, 0.05], [0.92, 0.05], [0.08, 0.95], [0.92, 0.95]]
  ],
  '2': [
    [[0.1, 0.25], [0.3, 0.05], [0.7, 0.05], [0.9, 0.25], [0.9, 0.45], [0.1, 0.95], [0.9, 0.95]]
  ],
  '0': [
    [[0.5, 0.05], [0.85, 0.18], [0.95, 0.5], [0.85, 0.82], [0.5, 0.95], [0.15, 0.82], [0.05, 0.5], [0.15, 0.18], [0.5, 0.05]]
  ],
  '6': [
    [[0.85, 0.15], [0.5, 0.05], [0.15, 0.35], [0.15, 0.85], [0.5, 0.95], [0.85, 0.85], [0.85, 0.55], [0.5, 0.5], [0.15, 0.65]]
  ],
  '7': [
    [[0.08, 0.05], [0.92, 0.05], [0.4, 0.95]]
  ],
  '-': [
    [[0.2, 0.5], [0.8, 0.5]]
  ],
  ' ': []
};

interface ParticleSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const LiveSpectrumVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState<'text' | 'lissajous' | 'rf'>('text');
  const [customText, setCustomText] = useState('ECE DEPARTMENT');
  const [beamColor, setBeamColor] = useState<'cyan' | 'amber' | 'emerald' | 'purple'>('cyan');
  const [waveGain, setWaveGain] = useState<number>(1.2);
  const [waveSpeed, setWaveSpeed] = useState<number>(1);
  const [showSparks, setShowSparks] = useState(true);
  const [audioHumEnabled, setAudioHumEnabled] = useState(false);
  const [probePos, setProbePos] = useState<{ x: number; y: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Toggle synthesized Web Audio Oscilloscope Hum
  const toggleAudioHum = () => {
    soundFx.playClick();
    if (audioHumEnabled) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
      }
      setAudioHumEnabled(false);
    } else {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!oscRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtxRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        gainNodeRef.current = gain;
      } else if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.015, audioCtxRef.current.currentTime, 0.05);
      }
      setAudioHumEnabled(true);
    }
  };

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Pre-compile normalized vector strokes when customText changes
  const normalizedStrokes = useMemo(() => {
    const sanitized = (customText || 'ECE').toUpperCase();
    const chars = sanitized.split('');
    const charCount = chars.length;

    const strokes: { x1: number; y1: number; x2: number; y2: number }[] = [];

    chars.forEach((char, cIdx) => {
      const glyphStrokes = VECTOR_ALPHABET[char] || VECTOR_ALPHABET[' '];
      const startX = cIdx / Math.max(1, charCount);
      const glyphWidth = (1 / Math.max(1, charCount)) * 0.84;

      if (!glyphStrokes || glyphStrokes.length === 0) return;

      glyphStrokes.forEach((stroke) => {
        for (let i = 0; i < stroke.length - 1; i++) {
          const p1 = stroke[i];
          const p2 = stroke[i + 1];
          strokes.push({
            x1: startX + p1[0] * glyphWidth,
            y1: p1[1],
            x2: startX + p2[0] * glyphWidth,
            y2: p2[1],
          });
        }
      });
    });

    return strokes;
  }, [customText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const sparks: ParticleSpark[] = [];

    const render = () => {
      // Crisp Retina DPI handling
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.parentElement?.getBoundingClientRect();
      const displayWidth = rect?.width || 450;
      const displayHeight = rect?.height || 180;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = displayWidth;
      const height = displayHeight;

      ctx.clearRect(0, 0, width, height);

      // ── 1. CRT Oscilloscope Graticule Grid ───────────────────────
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.06)';
      ctx.lineWidth = 1;

      // 10 vertical divisions
      const divX = width / 10;
      for (let i = 0; i <= 10; i++) {
        const x = i * divX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Cross ticks
        for (let t = 1; t < 5; t++) {
          const tickY = height / 2;
          ctx.beginPath();
          ctx.moveTo(x + (t * divX) / 5, tickY - 2.5);
          ctx.lineTo(x + (t * divX) / 5, tickY + 2.5);
          ctx.stroke();
        }
      }

      // 8 horizontal divisions
      const divY = height / 8;
      for (let j = 0; j <= 8; j++) {
        const y = j * divY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Theme Colors map
      const colorMap = {
        cyan:    { primary: '#00F2FE', glow: 'rgba(0, 242, 254, 0.3)', spark: '#00F2FE' },
        amber:   { primary: '#FFB800', glow: 'rgba(255, 184, 0, 0.3)', spark: '#FFD60A' },
        emerald: { primary: '#00FF9D', glow: 'rgba(0, 255, 157, 0.3)', spark: '#10B981' },
        purple:  { primary: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)', spark: '#C084FC' },
      };
      const curColor = colorMap[beamColor];

      // ── 2. MODE 1: Vector Waveform Text ("ECE DEPARTMENT") ───────
      if (activeMode === 'text') {
        // Channel 2 background reference analog wave
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 184, 0, 0.18)';
        const refAmp = (height * 0.14) * waveGain;
        for (let x = 0; x < width; x += 5) {
          const refY = (height / 2) + Math.sin(x * 0.03 + time * 3) * refAmp + Math.cos(x * 0.01 - time * 0.8) * (refAmp * 0.4);
          if (x === 0) ctx.moveTo(x, refY);
          else ctx.lineTo(x, refY);
        }
        ctx.stroke();

        const paddingX = Math.max(14, width * 0.035);
        const paddingY = Math.max(20, height * 0.22);
        const usableWidth = width - paddingX * 2;
        const usableHeight = height - paddingY * 2;

        if (normalizedStrokes.length > 0) {
          const totalSegments = normalizedStrokes.length;
          const beamSweep = ((time * 0.45 * waveSpeed) % 1) * totalSegments;
          const currentActiveSegment = Math.floor(beamSweep);

          // Render Outer Phosphor Corona (Batch path)
          ctx.beginPath();
          ctx.lineWidth = 5.5;
          ctx.strokeStyle = curColor.glow;

          normalizedStrokes.forEach((stroke) => {
            const sx1 = paddingX + stroke.x1 * usableWidth;
            const sy1 = paddingY + stroke.y1 * usableHeight;
            const sx2 = paddingX + stroke.x2 * usableWidth;
            const sy2 = paddingY + stroke.y2 * usableHeight;

            const steps = 14;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const bx = sx1 + (sx2 - sx1) * t;
              const by = sy1 + (sy2 - sy1) * t;
              const ripple = Math.sin(bx * 0.22 + by * 0.12 + time * 9) * (1.8 * waveGain);
              const harmonic = Math.cos(bx * 0.08 - time * 4) * (1.1 * waveGain);

              if (s === 0) ctx.moveTo(bx, by + ripple + harmonic);
              else ctx.lineTo(bx, by + ripple + harmonic);
            }
          });
          ctx.stroke();

          // Render Core Laser Wire (Batch path)
          ctx.beginPath();
          ctx.lineWidth = 2.2;
          ctx.strokeStyle = curColor.primary;

          normalizedStrokes.forEach((stroke, sIdx) => {
            const sx1 = paddingX + stroke.x1 * usableWidth;
            const sy1 = paddingY + stroke.y1 * usableHeight;
            const sx2 = paddingX + stroke.x2 * usableWidth;
            const sy2 = paddingY + stroke.y2 * usableHeight;

            const steps = 14;
            let activePointX = sx1;
            let activePointY = sy1;

            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const bx = sx1 + (sx2 - sx1) * t;
              const by = sy1 + (sy2 - sy1) * t;
              let ripple = Math.sin(bx * 0.22 + by * 0.12 + time * 9) * (1.8 * waveGain);
              let harmonic = Math.cos(bx * 0.08 - time * 4) * (1.1 * waveGain);

              if (probePos) {
                const dist = Math.hypot(bx - probePos.x, by - probePos.y);
                if (dist < 85) {
                  const force = (1 - dist / 85) * 18;
                  ripple += Math.sin(time * 20) * force;
                }
              }

              const py = by + ripple + harmonic;
              if (s === 0) ctx.moveTo(bx, py);
              else ctx.lineTo(bx, py);

              if (sIdx === currentActiveSegment && s === Math.floor((beamSweep % 1) * steps)) {
                activePointX = bx;
                activePointY = py;
              }
            }

            // Lead Electron Dot & Spark Generation
            if (sIdx === currentActiveSegment) {
              ctx.stroke(); // flush path

              // Electron Point
              ctx.beginPath();
              ctx.arc(activePointX, activePointY, 4.5, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();

              ctx.beginPath();
              ctx.arc(activePointX, activePointY, 8.5, 0, Math.PI * 2);
              ctx.strokeStyle = curColor.primary;
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Emit Laser Sparks
              if (showSparks && Math.random() > 0.35 && sparks.length < 20) {
                sparks.push({
                  x: activePointX,
                  y: activePointY,
                  vx: (Math.random() - 0.5) * 2.5,
                  vy: (Math.random() - 0.5) * 2.5 + 0.8,
                  life: 1,
                  maxLife: 14 + Math.random() * 12,
                  color: curColor.spark,
                });
              }

              ctx.beginPath();
              ctx.lineWidth = 2.2;
              ctx.strokeStyle = curColor.primary;
            }
          });
          ctx.stroke();
        }
      }

      // ── 3. MODE 2: 3D Quantum Lissajous Matrix ────────────────────
      else if (activeMode === 'lissajous') {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.36 * waveGain;

        ctx.beginPath();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = curColor.primary;

        const totalPoints = 180;
        for (let i = 0; i <= totalPoints; i++) {
          const t = (i / totalPoints) * Math.PI * 2;
          const a = 3;
          const b = 4;
          const delta = time * 2;

          const lx = cx + radius * Math.sin(a * t + delta);
          const ly = cy + radius * Math.sin(b * t);

          if (i === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }

      // ── 4. MODE 3: Harmonic RF Carrier Pulse Spectrum ────────────
      else if (activeMode === 'rf') {
        const cy = height / 2;
        const amp = (height * 0.35) * waveGain;

        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = curColor.primary;

        for (let x = 0; x < width; x += 2) {
          const carrier = Math.sin(x * 0.12 + time * 6);
          const mod = Math.sin(x * 0.015 + time * 1.2);
          const noise = (Math.random() - 0.5) * 2.5;
          const y = cy + carrier * mod * amp + noise;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── 5. Render Particle Sparks (Fast batch) ───────────────────
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 1;

        const alpha = Math.max(0, 1 - sp.life / sp.maxLife);
        if (alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      time += 0.032 * waveSpeed;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeMode, normalizedStrokes, beamColor, waveGain, waveSpeed, showSparks, probePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setProbePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setProbePos(null);
  };

  const quickPhrases = ['ECE DEPARTMENT', 'SPACE FORUM', 'SINC COUNCIL', 'VLSI SILICON', 'ROBOTICS'];

  return (
    <div className="w-full glass-cyber rounded-3xl p-4 sm:p-6 border border-lime/40 shadow-[0_0_45px_rgba(0,242,254,0.22)] relative overflow-hidden group">
      
      {/* Top Header & Visualizer Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10 text-xs font-mono">
        
        {/* Title */}
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime shadow-[0_0_10px_#00F2FE]"></span>
          </span>
          <span className="text-xs font-extrabold text-white tracking-wider flex items-center gap-1.5 font-space">
            <Activity className="w-4 h-4 text-lime" />
            <span>VECTOR CRT WAVEFORM SYNTHESIZER</span>
          </span>
        </div>

        {/* 3 Core Visualizer Modes */}
        <div className="flex items-center space-x-1.5 bg-midnight-deep p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { soundFx.playLaser(); setActiveMode('text'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'text'
                ? 'bg-lime text-midnight shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Vector Text</span>
          </button>
          <button
            onClick={() => { soundFx.playLaser(); setActiveMode('lissajous'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'lissajous'
                ? 'bg-amber text-midnight shadow-[0_0_15px_rgba(255,184,0,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>3D Lissajous</span>
          </button>
          <button
            onClick={() => { soundFx.playLaser(); setActiveMode('rf'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'rf'
                ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>RF Carrier</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Text Prompt & Laser Color Bar ─────────── */}
      {activeMode === 'text' && (
        <div className="pt-3 pb-1 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Phrase Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mr-1">PRESETS:</span>
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => { soundFx.playClick(); setCustomText(phrase); }}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  customText === phrase
                    ? 'bg-white text-midnight shadow-sm'
                    : 'bg-midnight-deep border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Custom Text Input */}
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-lime" />
            <input
              type="text"
              maxLength={18}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="TYPE CUSTOM TEXT..."
              className="bg-midnight-deep border border-white/15 px-3 py-1 rounded-lg text-[10px] font-mono text-lime uppercase font-bold focus:outline-none focus:border-lime w-40"
            />
          </div>
        </div>
      )}

      {/* ── Main CRT Screen Frame with "ECE DEPARTMENT" Waveform ─ */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-44 sm:h-52 my-3 rounded-2xl bg-[#010308] overflow-hidden border-2 border-white/15 shadow-[inset_0_0_50px_rgba(0,0,0,0.95)] cursor-crosshair will-change-transform"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
        
        {/* Top-Left Telemetry Overlay Box */}
        <div className="absolute top-3 left-3 flex items-center gap-2 text-[9px] font-mono text-slate-300 bg-midnight-deep/90 px-3 py-1 rounded-lg border border-white/15 backdrop-blur-md pointer-events-none shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse shadow-[0_0_6px_#00FF9D]" />
          <span>WAVEFORM: <strong className="text-lime">{activeMode === 'text' ? customText || 'ECE' : activeMode.toUpperCase()}</strong></span>
        </div>

        {/* Top-Right Interactive Hover Prompt */}
        <div className="absolute top-3 right-3 flex items-center gap-2 text-[9px] font-mono text-amber bg-midnight-deep/90 px-3 py-1 rounded-lg border border-amber/30 backdrop-blur-md pointer-events-none shadow-md font-bold">
          <PenTool className="w-3 h-3 text-amber" />
          <span>HOVER PROBE TO DISTORT WAVE</span>
        </div>

        {/* Bottom Status Readout */}
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-400 bg-midnight-deep/80 px-2.5 py-0.5 rounded border border-white/10 pointer-events-none">
          SYNTHESIS: RETINA_VECTOR_CRT · 50.0 µs TIMEBASE
        </div>
      </div>

      {/* ── Bottom Interactive Controls ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 pt-1 gap-3">
        
        {/* Laser Color Palette */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">LASER:</span>
          {(['cyan', 'amber', 'emerald', 'purple'] as const).map((col) => (
            <button
              key={col}
              onClick={() => { soundFx.playClick(); setBeamColor(col); }}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                beamColor === col ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
              style={{
                backgroundColor: col === 'cyan' ? '#00F2FE' : col === 'amber' ? '#FFB800' : col === 'emerald' ? '#00FF9D' : '#A855F7',
                boxShadow: beamColor === col ? `0 0 10px ${col === 'cyan' ? '#00F2FE' : col === 'amber' ? '#FFB800' : col === 'emerald' ? '#00FF9D' : '#A855F7'}` : undefined
              }}
            />
          ))}
        </div>

        {/* CRT Audio Hum Synthesizer Toggle */}
        <button
          onClick={toggleAudioHum}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm ${
            audioHumEnabled
              ? 'bg-amber/20 border-amber text-amber shadow-[0_0_15px_rgba(255,184,0,0.3)]'
              : 'bg-midnight-deep border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Synthesized CRT Audio Hum"
        >
          {audioHumEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{audioHumEnabled ? 'AUDIO HUM: ON (110Hz)' : 'SYNTH HUM: OFF'}</span>
        </button>

        {/* Laser Sparks Toggle */}
        <button
          onClick={() => { soundFx.playClick(); setShowSparks(!showSparks); }}
          className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            showSparks
              ? 'bg-lime/20 border-lime text-lime'
              : 'bg-midnight-deep border-white/10 text-slate-500'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>SPARKS: {showSparks ? 'ON' : 'OFF'}</span>
        </button>

        {/* Gain & Speed Adjusters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setWaveGain((g) => (g === 1.2 ? 1.7 : g === 1.7 ? 0.8 : 1.2));
            }}
            className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-lime cursor-pointer bg-midnight-deep px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
          >
            <Sliders className="w-3 h-3 text-lime" />
            <span>GAIN: {waveGain}x</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setWaveSpeed((s) => (s === 1 ? 1.6 : s === 1.6 ? 0.6 : 1));
            }}
            className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-amber cursor-pointer bg-midnight-deep px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber" />
            <span>SPEED: {waveSpeed}x</span>
          </button>
        </div>

      </div>
    </div>
  );
};
