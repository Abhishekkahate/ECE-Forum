import React from 'react';
import { Compass, ArrowRight, Flame, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const AboutSection: React.FC = () => {
  const revealRef = useScrollReveal(0.06);

  return (
    <section
      id="about"
      ref={revealRef}
      className="relative py-24 bg-transparent overflow-hidden"
    >
      {/* Laser Gradient Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/25 to-transparent" />

      {/* Ambient Volumetric Lighting */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-lime/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              <Compass className="w-3.5 h-3.5 text-lime" />
              <span>01 // ABOUT THE COUNCILS</span>
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Dual-Council Ecosystem &amp;
              <br className="hidden sm:block" />
              Department Governance.
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            SPACE &amp; SINC drive academic excellence and hardware prototyping across ECE at PIET.
          </p>
        </div>

        {/* ── Dual Council Spotlight Cards (SPACE & SINC) ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
          
          {/* SPACE Forum Card */}
          <div 
            onClick={() => {
              soundFx.playLaser();
              const el = document.getElementById('team');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#080D1A] to-[#04060C] border border-amber-500/30 hover:border-amber-400/70 flex flex-col justify-between space-y-5 group transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(255,184,0,0.2)] cursor-pointer"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src="/space_logo.webp" alt="SPACE Forum" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber tracking-wider uppercase">
                    ESTD. 2012
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-space font-extrabold text-xl sm:text-2xl text-white group-hover:text-amber transition-colors">
                  SPACE FORUM
                </h3>
                <span className="text-xs font-mono text-amber">
                  Student's Progressive Assoc.
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Driving technical research, IEEE student chapters, workshops, and the annual ELEKTRONIKOS magazine.
              </p>

              {/* Council Key Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                {['IEEE Chapter', 'Technical Papers', 'TARANG Gala'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-midnight-deep border border-amber-500/20 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-1 pt-2.5 text-xs font-mono text-slate-300 border-t border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">Incharge:</span>
                  <strong className="text-white">Dr. Sunita N Parihar</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">President:</span>
                  <strong className="text-amber">Rohan Virutkar</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-amber flex items-center justify-between border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber" />
                <span>View Leadership</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* SINC Council Card */}
          <div 
            onClick={() => {
              soundFx.playLaser();
              const el = document.getElementById('team');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#050A18] to-[#04060C] border border-lime/30 hover:border-lime/70 flex flex-col justify-between space-y-5 group transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(0,242,254,0.2)] cursor-pointer"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/30 p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src="/sinc_logo.webp" alt="SINC Council" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-xl bg-lime/15 border border-lime/40 text-lime tracking-wider uppercase">
                    ESTD. 2018
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-space font-extrabold text-xl sm:text-2xl text-white group-hover:text-lime transition-colors">
                  SINC COUNCIL
                </h3>
                <span className="text-xs font-mono text-lime">
                  Student Innovation Council
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Dedicated to rapid hardware prototyping, autonomous robotics, patent filings, and national hackathons.
              </p>

              {/* Council Key Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                {['Hardware Labs', 'Patents', 'Robotics Arena'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-midnight-deep border border-lime/20 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-1 pt-2.5 text-xs font-mono text-slate-300 border-t border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">Incharge:</span>
                  <strong className="text-white">Ms. V. V. Shirpurkar</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">President:</span>
                  <strong className="text-lime">Makarand Bahmane</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-lime flex items-center justify-between border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-lime" />
                <span>View Leadership</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
