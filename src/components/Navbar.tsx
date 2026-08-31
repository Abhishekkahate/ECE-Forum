import React, { useState, useEffect, useRef } from 'react';
import { Shield, VolumeX, Menu, X, Ticket, LogOut, ChevronDown, ArrowUpRight, Search, Command, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { passService } from '../services/passService';
import { certificateService } from '../services/certificateService';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  onOpenGoogleAuth: () => void;
  onOpenMyPasses: () => void;
  onOpenMyCertificates: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGoogleAuth, onOpenMyPasses, onOpenMyCertificates, onOpenAdmin }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeLink, setActiveLink] = useState('#hero');
  const [userPassCount, setUserPassCount] = useState(0);
  const [userCertCount, setUserCertCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  const updateCounts = () => {
    if (user?.email) {
      setUserPassCount(passService.getUserPasses(user.email).length);
      setUserCertCount(certificateService.getUserCertificates(user.email).length);
    } else {
      setUserPassCount(0);
      setUserCertCount(0);
    }
  };

  useEffect(() => {
    setIsAudioActive(soundFx.isEnabled());
    let ticking = false;
    let lastProg = 0;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        setScrolled(y > 16);
        if (y > 120) {
          if (y > lastY.current + 8) setHidden(true);
          else if (y < lastY.current - 8) setHidden(false);
        } else setHidden(false);
        lastY.current = y;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const prog = h > 0 ? Math.min(100, (y / h) * 100) : 0;
        // only update progress if changed >0.5 to avoid micro renders
        if (Math.abs(prog - lastProg) > 0.5) {
          lastProg = prog;
          setProgress(prog);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    updateCounts();
    const h = () => updateCounts();
    window.addEventListener('ece_passes_updated', h);
    window.addEventListener('ece_certificates_updated', h);
    return () => {
      window.removeEventListener('ece_passes_updated', h);
      window.removeEventListener('ece_certificates_updated', h);
    };
  }, [user?.email]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileMenuOpen(false); setUserDropdownOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // dispatch to App's command palette via custom event
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSoundEffects = () => setIsAudioActive(soundFx.toggleSound());

  const navLinks = [
    { label: 'Overview', href: '#hero', num: '01' },
    { label: 'Atelier', href: '#about', num: '02' },
    { label: 'Telemetry', href: '#stats', num: '03' },
    { label: 'Events', href: '#events', num: '04' },
    { label: 'Archive', href: '#gallery', num: '05' },
    { label: 'Prestige', href: '#achievements', num: '06' },
    { label: 'Advisors', href: '#faculty', num: '07' },
    { label: 'Command', href: '#team', num: '08' },
  ];

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveLink('#' + e.target.id); });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const activeIdx = navLinks.findIndex((l) => l.href === activeLink);

  return (
    <>
      {/* editorial top rule + progress */}
      <div className={`fixed top-0 left-0 right-0 z-[60] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
        <div className="h-full bg-[#FF4A15] transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(255,74,21,0.55)]" style={{ width: `${progress}%` }} />
      </div>

      <header
        className={`fixed inset-x-0 z-50 transition-transform duration-500 ease-out will-change-transform ${hidden && !mobileMenuOpen ? '-translate-y-[88%]' : 'translate-y-0'}`}
        style={{ top: 0 }}
      >
        {/* full-bleed rail bar */}
        <div className={`relative border-b transition-all duration-500 ${scrolled ? 'bg-[rgba(8,8,10,0.92)] backdrop-blur-2xl border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.45)]' : 'bg-[rgba(8,8,10,0.88)] backdrop-blur-xl border-white/[0.06]'} `}>
          {/* signal hairline when scrolled */}
          <span className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/40 to-transparent transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
          <div className="hidden xl:flex absolute left-0 top-0 bottom-0 w-[56px] border-r border-white/[0.06] items-center justify-center">
            <span className="text-[10px] font-mono tracking-[0.18em] text-white/30 [writing-mode:vertical-rl] rotate-180">ATELIER — 08 — {String(activeIdx + 1).padStart(2,'0')}/08</span>
          </div>

          <div className="mx-auto max-w-[1600px] xl:pl-[56px] px-3 sm:px-6 lg:px-8">
            <div className={`flex items-center justify-between gap-3 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
              {/* Brand */}
              <a href="#hero" onClick={() => soundFx.playClick()} className="group flex items-center gap-3 shrink-0" aria-label="Go to overview">
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.10] backdrop-blur group-hover:border-white/15 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3EF] p-1 grid place-items-center overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.25)]"><img src="/space_logo.webp" alt="SPACE" className="w-full h-full object-contain" /></div>
                  <span className="hidden sm:flex w-3 h-3 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)] items-center justify-center"><span className="w-1 h-1 rounded-full bg-white" /></span>
                  <span className="sm:hidden text-[8px] font-mono font-bold text-white/35">×</span>
                  <div className="w-8 h-8 rounded-full bg-[#F5F3EF] border border-white p-1 grid place-items-center overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.15)]"><img src="/sinc_logo.webp" alt="SINC" className="w-full h-full object-contain" style={{ filter: 'brightness(0.15)' }} /></div>
                </div>
                <div className="hidden sm:block leading-none">
                  <div className="flex items-center gap-2">
                    <span className="font-[Syne] font-[800] text-[13px] tracking-[-0.03em] text-[#F5F3EF] group-hover:text-white transition-colors">ECE FORUM</span>
                    <span className="hidden lg:inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#FF4A15] text-white font-bold tracking-[0.08em]">2026—27</span>
                    <span className="hidden xl:inline-flex w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse shadow-[0_0_8px_rgba(255,74,21,0.6)]" />
                  </div>
                  <span className="block text-[10px] font-mono tracking-[0.16em] text-white/40 mt-[2px]">PIET <span className="text-[#FF4A15]">·</span> SPACE × SINC</span>
                </div>
              </a>

              {/* Desktop nav — underline editorial, hide until xl to prevent overflow */}
              <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 min-w-0 overflow-hidden" aria-label="Primary">
                {navLinks.map((link) => {
                  const isActive = activeLink === link.href;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        soundFx.playClick();
                        setActiveLink(link.href);
                        const el = document.querySelector(link.href);
                        if (el) {
                          if ((window as any).__lenis) {
                            (window as any).__lenis.scrollTo(el, { offset: -70, duration: 1.15 });
                          } else {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative px-2.5 xl:px-3 py-2 rounded-full text-[11px] font-mono tracking-[0.06em] uppercase flex items-center gap-1.5 transition-all ${isActive ? 'text-[#F5F3EF] bg-white/[0.06] border border-white/[0.08]' : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}
                    >
                      <span className={`text-[9px] tabular-nums ${isActive ? 'text-[#FF4A15] font-bold' : 'text-white/25 group-hover:text-white/40'}`}>{link.num}</span>
                      <span>{link.label}</span>
                      <span className={`pointer-events-none absolute left-3 right-3 -bottom-0.5 h-px bg-[#FF4A15] transition-all ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50 group-hover:opacity-40 group-hover:scale-x-100'}`} />
                    </a>
                  );
                })}
              </nav>

              {/* Search hint + actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
                  className="hidden lg:inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/12 text-white/45 hover:text-white/80 text-[11px] font-mono transition-colors"
                  title="Command palette (⌘K)"
                >
                  <Search className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Search</span> <span className="hidden xl:inline-flex items-center gap-1 ml-1 pl-2 border-l border-white/10 text-[10px]"><Command className="w-3 h-3" />K</span>
                </button>

                <button onClick={() => { soundFx.playClick(); onOpenMyPasses(); }} className="hidden sm:inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/60 hover:text-white text-[11px] font-mono transition-colors">
                  <span className="w-6 h-6 rounded-full bg-white/[0.07] grid place-items-center"><Ticket className="w-3 h-3" /></span> <span className="hidden md:inline uppercase tracking-[0.04em]">Passes</span>
                  {userPassCount > 0 && <span className="ml-0.5 min-w-5 h-5 px-1.5 rounded-full bg-[#FF4A15] text-white text-[10px] font-bold grid place-items-center shadow-[0_0_10px_rgba(255,74,21,0.5)]">{userPassCount}</span>}
                </button>

                <button onClick={() => { soundFx.playClick(); onOpenMyCertificates(); }} className="hidden sm:inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/60 hover:text-white text-[11px] font-mono transition-colors" title="My Certificates">
                  <span className="w-6 h-6 rounded-full bg-[#FFD700]/10 text-[#FFD700] grid place-items-center"><Award className="w-3 h-3" /></span> <span className="hidden md:inline uppercase tracking-[0.04em]">Certificates</span>
                  {userCertCount > 0 && <span className="ml-0.5 min-w-5 h-5 px-1.5 rounded-full bg-[#FFD700] text-black text-[10px] font-bold grid place-items-center shadow-[0_0_10px_rgba(255,215,0,0.5)]">{userCertCount}</span>}
                </button>

                <button onClick={toggleSoundEffects} aria-pressed={isAudioActive} className={`hidden sm:inline-flex w-8 h-8 rounded-full border grid place-items-center transition-colors ${isAudioActive ? 'bg-[#FF4A15]/10 border-[#FF4A15]/25 text-[#FF4A15]' : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white'}`}>
                  {isAudioActive ? <span className="flex items-end gap-[2px] h-3"><span className="w-[2px] bg-[#FF4A15] eq-bar-1 rounded-full" /><span className="w-[2px] bg-[#FF4A15] eq-bar-2 rounded-full" /><span className="w-[2px] bg-[#FF4A15] eq-bar-3 rounded-full" /></span> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button onClick={() => { soundFx.playLaser(); onOpenAdmin(); }} className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.06] text-[11px] font-mono uppercase">
                  <Shield className="w-3 h-3 text-[#FF4A15]" /> Admin
                </button>

                {isAuthenticated && user ? (
                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.07] border border-white/10 hover:bg-white/[0.10] text-[#F5F3EF] transition-colors">
                      <img src={user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email)}`} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-white/15" />
                      <span className="text-[12px] font-medium hidden md:inline max-w-[84px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-white/35 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[rgba(12,12,14,0.96)] backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] p-2 z-50">
                        <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-1.5">
                          <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
                          <div className="text-[11px] font-mono text-white/40 truncate">{user.email}</div>
                          {user.rollNumber && <div className="mt-2 inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4A15]/15 text-[#FF4A15] border border-[#FF4A15]/20 font-bold">{user.rollNumber}</div>}
                        </div>
                        <button onClick={() => { setUserDropdownOpen(false); onOpenMyPasses(); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 text-[12.5px] text-white/80"><Ticket className="w-3.5 h-3.5 text-[#FF4A15]" /> My Passes {userPassCount>0 && <span className="ml-auto bg-[#FF4A15] text-white text-[10px] px-1.5 py-0.5 rounded-full">{userPassCount}</span>}</button>
                        <button onClick={() => { setUserDropdownOpen(false); onOpenMyCertificates(); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 text-[12.5px] text-white/80"><Award className="w-3.5 h-3.5 text-[#FFD700]" /> My Certificates {userCertCount>0 && <span className="ml-auto bg-[#FFD700] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{userCertCount}</span>}</button>
                        <a href="/verify" onClick={() => setUserDropdownOpen(false)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 text-[12.5px] text-white/80"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verify Certificate</a>
                        <button onClick={() => { setUserDropdownOpen(false); logout(); soundFx.playClick(); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 flex items-center gap-2.5 text-[12.5px] text-white/60 hover:text-red-300"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => { soundFx.playClick(); onOpenGoogleAuth(); }} className="hidden sm:inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-[#F5F3EF] text-[#08080A] font-semibold text-[12px] hover:bg-white transition-colors">
                    <span className="w-5 h-5 rounded-full bg-white grid place-items-center border border-black/5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg></span> Sign in
                  </button>
                )}

                <a href="#events" onClick={() => soundFx.playClick()} className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full bg-[#FF4A15] text-white font-bold text-[12px] hover:bg-[#E84410] hover:shadow-[0_8px_20px_rgba(255,74,21,0.35)] transition-all group/cta shrink-0">
                  <span className="uppercase tracking-[0.02em]">Register</span><span className="w-6 h-6 rounded-full bg-white text-[#FF4A15] grid place-items-center group-hover/cta:rotate-45 transition-transform"><ArrowUpRight className="w-3 h-3" /></span>
                </a>

                <button onClick={() => { soundFx.playClick(); setMobileMenuOpen(!mobileMenuOpen); }} className={`xl:hidden w-8 h-8 rounded-full grid place-items-center border transition-colors shrink-0 ${mobileMenuOpen ? 'bg-[#FF4A15] border-[#FF4A15] text-white' : 'bg-[#F5F3EF] text-[#08080A] border-white/10'}`} aria-expanded={mobileMenuOpen}>
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* peek handle when hidden */}
        <button onClick={() => setHidden(false)} className={`hidden xl:flex fixed left-1/2 -translate-x-1/2 z-[60] items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(12,12,14,0.92)] border border-white/10 text-[11px] font-mono tracking-[0.08em] text-white/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all ${hidden ? 'top-3 opacity-100 translate-y-0' : 'top-0 opacity-0 -translate-y-4 pointer-events-none'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15] animate-pulse" /> MENU
        </button>

        {/* Mobile drawer — show below xl where desktop nav is hidden */}
        {mobileMenuOpen && (
          <div className="xl:hidden mx-3 mt-2 rounded-[24px] bg-[rgba(12,12,14,0.98)] backdrop-blur-3xl border border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in zoom-in-[0.98] duration-200">
            <div className="h-px bg-gradient-to-r from-transparent via-[#FF4A15]/50 to-transparent" />
            <div className="p-3.5 space-y-3 max-h-[78vh] overflow-y-auto custom-scrollbar">
              
              {/* Mobile User Authentication / Profile Card */}
              {isAuthenticated && user ? (
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email)}`}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#FF4A15]/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10.5px] font-mono text-white/45 truncate">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); soundFx.playClick(); }}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono font-bold flex items-center gap-1 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Exit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); soundFx.playClick(); onOpenGoogleAuth(); }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#F5F3EF] text-[#08080A] font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] transition-transform"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google Account</span>
                </button>
              )}

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isActive = activeLink === link.href;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => { soundFx.playClick(); setMobileMenuOpen(false); }}
                      className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#FF4A15] border-[#FF4A15] text-white font-bold shadow-md'
                          : 'bg-white/[0.04] border-white/[0.06] text-white/85 active:bg-white/[0.10]'
                      }`}
                    >
                      <span className="uppercase tracking-[0.02em] font-semibold">{link.label}</span>
                      <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-white/30'}`}>{link.num}</span>
                    </a>
                  );
                })}
              </div>

              {/* Quick Utility Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.07]">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenMyPasses(); }}
                  className="py-2.5 px-2 rounded-xl bg-[#FF4A15]/10 border border-[#FF4A15]/20 text-[#FF4A15] font-mono text-[11px] font-bold flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Passes ({userPassCount})</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenMyCertificates(); }}
                  className="py-2.5 px-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] font-mono text-[11px] font-bold flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Certificates ({userCertCount})</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/80 font-mono text-[11px] font-bold flex flex-col items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify Portal</span>
                </a>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                  className="py-2.5 px-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/80 font-mono text-[11px] font-bold flex flex-col items-center justify-center gap-1"
                >
                  <Shield className="w-4 h-4 text-[#FF4A15]" />
                  <span>Admin Hub</span>
                </button>
                <button
                  onClick={() => {
                    toggleSoundEffects();
                  }}
                  className={`py-2.5 px-2 rounded-xl border font-mono text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                    isAudioActive
                      ? 'bg-[#FF4A15]/10 border-[#FF4A15]/25 text-[#FF4A15]'
                      : 'bg-white/[0.05] border-white/[0.08] text-white/50'
                  }`}
                >
                  {isAudioActive ? <span className="flex items-end gap-[2px] h-4 mb-0.5"><span className="w-[2px] bg-[#FF4A15] eq-bar-1 rounded-full" /><span className="w-[2px] bg-[#FF4A15] eq-bar-2 rounded-full" /><span className="w-[2px] bg-[#FF4A15] eq-bar-3 rounded-full" /></span> : <VolumeX className="w-4 h-4" />}
                  <span>Sound: {isAudioActive ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Command Palette Launcher */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 text-[11px] font-mono flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#FF4A15]" /> Search Atelier &amp; Portals
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">⌘K</span>
              </button>

            </div>
          </div>
        )}
      </header>
    </>
  );
};
