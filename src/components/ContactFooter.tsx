import React, { useState } from 'react';
import { Mail, MapPin, Send, Globe, ArrowUpRight, ArrowUp, Sparkles, Cpu } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export const ContactFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const revealRef = useScrollReveal(0.05);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    soundFx.playSuccess();
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4500);
  };

  const scrollToTop = () => {
    soundFx.playLaser();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { num: '00', label: 'Overview',     href: '#hero' },
    { num: '01', label: 'Architecture', href: '#about' },
    { num: '02', label: 'Calendar',     href: '#events' },
    { num: '03', label: 'Archive',      href: '#gallery' },
    { num: '04', label: 'Prestige',     href: '#achievements' },
    { num: '05', label: 'Advisors',     href: '#faculty' },
    { num: '06', label: 'Directory',    href: '#team' },
  ];

  return (
    <footer
      ref={revealRef}
      className="relative bg-[#020306]/90 backdrop-blur-md overflow-hidden border-t border-white/10"
    >
      {/* Top Laser Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent" />

      {/* Background Volumetric Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-lime/[0.025] rounded-full blur-[160px] pointer-events-none" />

      {/* ── Big High-Impact Branding Banner ───────────────────── */}
      <div className="border-b border-white/10 py-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
            
            {/* Monumental Text */}
            <div className="reveal space-y-4">
              <div className="section-eyebrow-hud">
                <span>ELECTRONICS &amp; COMMUNICATION FORUM</span>
              </div>
              <h2 className="font-space text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none">
                Engineering
                <br />
                <span className="text-gradient-cyan">Tomorrow's</span>
                <br />
                Silicon.
              </h2>
            </div>

            {/* Back to Top Rocket Button */}
            <div className="reveal stagger-2 space-y-5">
              <p className="text-sm text-slate-300 font-sans max-w-sm leading-relaxed">
                The official student forum powering silicon synthesis, robotics, edge AI, and IEEE excellence.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={scrollToTop}
                  className="btn-cyber-primary cursor-pointer text-xs"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>Ascend to Top</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Footer Coordinates Grid ─────────────────────── */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">

            {/* Brand identity (4 cols) */}
            <div className="lg:col-span-4 space-y-5 reveal">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-midnight-lighter border border-white/15 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0C1220] border border-amber-500/30 p-1 flex items-center justify-center">
                    <img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(255,184,0,0.5)]" />
                  </div>
                  <span className="text-slate-600 text-[10px] font-mono font-bold">×</span>
                  <div className="w-8 h-8 rounded-lg bg-[#0C1220] border border-lime/30 p-1 flex items-center justify-center">
                    <img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(0,242,254,0.5)]" />
                  </div>
                </div>
                <div>
                  <span className="font-space font-extrabold text-base text-white block">SPACE &amp; SINC FORUM</span>
                  <span className="text-[9px] font-mono text-lime uppercase tracking-widest font-bold">
                    Dept of Electronics &amp; Communication
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Building tomorrow's engineers through silicon synthesis, IoT, and robotics innovation.
              </p>
            </div>

            {/* Quick Navigation (3 cols) */}
            <div className="lg:col-span-3 space-y-4 reveal stagger-2">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-lime" />
                <span>Command Index</span>
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-xs font-mono">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => soundFx.playClick()}
                      className="text-slate-400 hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-[9px] text-lime/60">{link.num}</span>
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coordinates (2 cols) */}
            <div className="lg:col-span-2 space-y-4 reveal stagger-3">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber" />
                <span>Coordinates</span>
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400 font-sans">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                  <span>PIET Campus, ECE Department, Nagpur, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber shrink-0" />
                  <span className="font-mono text-[11px]">ece.forum@piet.edu</span>
                </div>
              </div>
            </div>

            {/* Dispatch Newsletter (3 cols) */}
            <div className="lg:col-span-3 space-y-4 reveal stagger-4">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyber-purple" />
                <span>Dispatch Radar</span>
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Subscribe for official hackathon alerts, silicon bootcamps, and forum announcements.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="footer-email-input"
                    className="form-input pr-11"
                  />
                  <button
                    type="submit"
                    id="footer-subscribe-btn"
                    title="Subscribe"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white text-midnight hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs font-mono text-cyber-emerald flex items-center gap-1.5 animate-in fade-in">
                    <span>✓</span>
                    <span>Dispatch frequency locked! You are registered.</span>
                  </p>
                )}
              </form>
            </div>

          </div>

            {/* Bottom Telemetry Bar */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4 reveal">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
                <span>© 2026 SPACE &amp; SINC ECE FORUM. ALL RIGHTS RESERVED.</span>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <a
                  href="/register"
                  className="hover:text-lime transition-colors flex items-center gap-1 text-slate-400 group font-bold"
                >
                  <span>Registration Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-lime transition-colors" />
                </a>
                <a
                  href="/admin"
                  className="hover:text-amber transition-colors flex items-center gap-1 text-slate-400 group font-bold"
                >
                  <span>Admin Console</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber transition-colors" />
                </a>
                {['Privacy Charter', 'Operations Manual', 'IEEE Code'].map((link) => (
                  <a
                    key={link}
                    href="#hero"
                    className="hover:text-slate-300 transition-colors flex items-center gap-1 group"
                  >
                    <span>{link}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-lime transition-colors" />
                  </a>
                ))}
              </div>
            </div>

        </div>
      </div>
    </footer>
  );
};
