import React, { useState } from 'react';
import { Mail, MapPin, Send, Globe, ArrowUpRight, ArrowUp, Sparkles, Cpu, Layers, Verified, Radio } from 'lucide-react';
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
    { num: '01', label: 'Overview', href: '#hero' },
    { num: '02', label: 'Atelier', href: '#about' },
    { num: '03', label: 'Telemetry', href: '#stats' },
    { num: '04', label: 'Events & Registration', href: '#events' },
    { num: '05', label: 'Visual Archive', href: '#gallery' },
    { num: '06', label: 'Prestige & Patents', href: '#achievements' },
    { num: '07', label: 'Faculty Board', href: '#faculty' },
    { num: '08', label: 'Command Council', href: '#team' },
  ];

  return (
    <footer id="contact" ref={revealRef} className="relative bg-[#050507] text-[#F5F3EF] overflow-hidden border-t border-white/[0.07]">
      {/* blueprint base */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.12) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute inset-0 editorial-grid opacity-[0.05]" />
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] rounded-full blur-[90px] opacity-[0.06]" style={{ background: 'radial-gradient(ellipse at center, #FF4A15 0%, transparent 70%)' }} />
      </div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/22 to-transparent" />

      {/* Editorial massive */}
      <div className="relative border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-20 pb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
            <div className="reveal space-y-5 max-w-[680px]">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,74,21,0.09)] border border-[rgba(255,74,21,0.18)] px-3.5 py-1.5 text-[10.5px] font-mono tracking-[0.14em] font-bold text-[#FF4A15] backdrop-blur">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)] animate-pulse" />
                  ELECTRONICS & COMMUNICATION — PIET NAGPUR
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.10em] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/45">
                  <Verified className="w-3 h-3 text-[#FF4A15]" /> ATELIER No.08 — 2026–27
                </span>
              </div>
              <h2 className="font-display font-[800] tracking-[-0.05em] leading-[0.86] text-[36px] sm:text-[48px] lg:text-[68px] text-[#F5F3EF]">
                Engineering
                <br />
                <span className="font-serif italic font-[400] tracking-[-0.04em] text-[#FF4A15]">tomorrow&apos;s</span> silicon.
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF4A15] text-white font-mono font-bold tracking-[0.06em] text-[12px] px-6 py-3 hover:bg-[#E63E0F] hover:shadow-[0_10px_28px_rgba(255,74,21,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <ArrowUp className="w-4 h-4" /> Back to top
                </button>
                <a
                  href="#events"
                  onClick={() => soundFx.playClick()}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#08080A] font-mono font-bold tracking-[0.06em] text-[12px] px-6 py-3 hover:bg-[#F5F3EF] hover:shadow-[0_10px_28px_rgba(255,255,255,0.12)] transition-all"
                >
                  Enter Portal <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-white/30">
                <span className="h-px w-8 bg-white/15" />
                <span className="inline-flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-[#FF4A15]/60" /> VLSI · RISC-V · LoRa Mesh · TinyML — built in the lab, proven nationally.</span>
              </div>
            </div>

            <div className="reveal stagger-2 w-full lg:max-w-[380px] space-y-4">
              <div className="rounded-[24px] bg-[rgba(15,15,17,0.82)] border border-white/[0.08] backdrop-blur-xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.14em] font-bold text-[#FF4A15]">
                  <Radio className="w-3.5 h-3.5" /> DISPATCH — FORUM BROADCASTS
                </div>
                <h3 className="mt-2 font-display font-bold text-[18px] leading-tight text-[#F5F3EF]">Stay on the signal.</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed font-mono text-white/55">
                  Hackathon alerts, workshop registrations &amp; atelier dispatches — one email, zero spam.
                </p>
                <form onSubmit={handleSubscribe} autoComplete="off" className="mt-4 relative">
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="student@piet.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full bg-[#08080A] border border-white/[0.08] pl-4 pr-[52px] py-3 text-[12px] font-mono text-[#F5F3EF] placeholder:text-white/25 focus:outline-none focus:border-[rgba(255,74,21,0.35)] focus:shadow-[0_0_0_3px_rgba(255,74,21,0.12)] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 w-10 h-10 rounded-full bg-[#FF4A15] text-white grid place-items-center hover:bg-[#E63E0F] hover:shadow-[0_6px_16px_rgba(255,74,21,0.35)] transition-all"
                    aria-label="Subscribe"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                {subscribed ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Subscribed — check your inbox.
                  </p>
                ) : (
                  <p className="mt-3 text-[10px] font-mono tracking-[0.08em] text-white/25 inline-flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Atelier dispatch · ~2 mails / month · unsubscribe anytime
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="text-white/30 tracking-[0.10em] font-bold text-[10px] flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#FF4A15]" /> ESTD</div>
                  <div className="font-display font-bold text-[#F5F3EF] text-[16px] mt-1">SPACE × SINC</div>
                  <div className="text-white/40 mt-0.5">Dual-council atelier</div>
                </div>
                <div className="rounded-2xl bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.12)] p-4">
                  <div className="text-[#FF4A15] tracking-[0.10em] font-bold text-[10px]">SESSION</div>
                  <div className="font-display font-bold text-white text-[16px] mt-1">2026–27</div>
                  <div className="text-white/50 mt-0.5">PIET ECE Forum</div>
                </div>
              </div>
            </div>
          </div>

          {/* massive watermark */}
          <div className="reveal mt-10 border-y border-white/[0.05] py-5 overflow-hidden">
            <div className="font-display font-[800] tracking-[-0.06em] leading-none text-[14vw] lg:text-[11.5vw] text-transparent whitespace-nowrap select-none pointer-events-none" style={{ WebkitTextStroke: '1px rgba(245,243,239,0.07)', color: 'transparent' }}>
              SPACE × SINC — PIET ECE FORUM
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono tracking-[0.12em] text-white/20">
              <span>ATELIER BLUEPRINT — SCALE 1:1 — ECE BLOCK — NAGPUR</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]" /> SIGNAL GRID ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* link grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-white/[0.07]">
          <div className="lg:col-span-4 space-y-4 reveal">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur">
                <div className="w-8 h-8 rounded-full bg-white p-1 grid place-items-center overflow-hidden shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                  <img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" />
                </div>
                <span className="text-white/20 text-[10px] font-mono">×</span>
                <div className="w-8 h-8 rounded-full bg-[#F5F3EF] border border-white p-1 grid place-items-center overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
                  <img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" style={{ filter: 'brightness(0.15)' }} />
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-[#F5F3EF] text-[15px] leading-tight">SPACE &amp; SINC FORUM</div>
                <div className="text-[10.5px] font-mono tracking-[0.08em] text-white/35">Dept of ECE · PIET Nagpur · Atelier No.08</div>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed font-mono text-white/45">
              Two councils, one culture — empowering tomorrow&apos;s engineers through silicon synthesis, autonomy and edge intelligence. Built in Hingna labs, proven nationally.
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.10em] font-bold px-3 py-1.5 rounded-full bg-[rgba(255,74,21,0.08)] border border-[rgba(255,74,21,0.16)] text-[#FF4A15]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse" /> SYSTEM STATUS — OPERATIONAL
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3 reveal stagger-2">
            <h4 className="text-[11px] font-mono tracking-[0.14em] font-bold text-white/50 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#FF4A15]" /> PORTAL INDEX
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-[12px] font-mono">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => soundFx.playClick()}
                    className="group inline-flex items-center gap-2 text-white/50 hover:text-[#F5F3EF] transition-colors"
                  >
                    <span className="text-[10px] tracking-[0.10em] text-white/20 group-hover:text-[#FF4A15] transition-colors">{l.num}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#FF4A15] transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3 reveal stagger-3">
            <h4 className="text-[11px] font-mono tracking-[0.14em] font-bold text-white/50 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#FF4A15]" /> COORDINATES
            </h4>
            <div className="space-y-3 text-[12px] font-mono text-white/50">
              <div className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF4A15] shrink-0 mt-0.5" />
                <span className="leading-relaxed">PIET Campus, ECE Dept,<br />Hingna Rd, Nagpur, MH — 441110</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-[#FF4A15] shrink-0" />
                <a href="mailto:ece.forum@piet.edu" onClick={() => soundFx.playClick()} className="hover:text-[#F5F3EF] hover:underline decoration-[#FF4A15]/40 underline-offset-4">ece.forum@piet.edu</a>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.10em] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> VISITING HOURS 10:00—17:00
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3 reveal stagger-4">
            <h4 className="text-[11px] font-mono tracking-[0.14em] font-bold text-white/50 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4A15]" /> QUICK ACTIONS
            </h4>
            <div className="space-y-2">
              <a href="/register" className="w-full inline-flex items-center justify-between rounded-full bg-white text-[#08080A] font-mono font-bold text-[12px] px-5 py-3 hover:bg-[#F5F3EF] transition-colors">
                Registration Portal <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="/admin" className="w-full inline-flex items-center justify-between rounded-full bg-white/[0.06] border border-white/[0.10] text-white font-mono font-bold text-[12px] px-5 py-3 hover:bg-white hover:text-black transition-colors">
                Admin Console <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] font-mono leading-relaxed text-white/30">
              Secure passes, live telemetry &amp; admin registry — all dispatch systems are audited.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <span className="inline-flex items-center gap-2 text-white/30">
            <span className="w-2 h-2 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.5)] animate-pulse" /> © 2026–27 SPACE &amp; SINC · PIET ECE FORUM — ATELIER No.08
          </span>
          <div className="flex flex-wrap items-center gap-4 text-white/25">
            <a href="/register" className="hover:text-white inline-flex items-center gap-1 transition-colors">Registration Portal <ArrowUpRight className="w-3 h-3" /></a>
            <span className="hidden sm:inline w-px h-3 bg-white/10" />
            <a href="/admin" className="hover:text-white inline-flex items-center gap-1 transition-colors">Admin Console <ArrowUpRight className="w-3 h-3" /></a>
            <span className="hidden sm:inline w-px h-3 bg-white/10" />
            <a href="#hero" className="hover:text-white transition-colors">Privacy &amp; Ethics</a>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[9px] font-mono tracking-[0.12em] text-white/15 border-t border-white/[0.04] pt-4">
          <span>BLUEPRINT REF — SPACE×SINC — GRID 36×36 — SIGNAL #FF4A15 — BG #08080A — INK #F5F3EF</span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/10" />
          <span className="hidden sm:inline">TYPE — SYNE + JETBRAINS MONO</span>
        </div>
      </div>
    </footer>
  );
};
