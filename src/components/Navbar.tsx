import React, { useState, useEffect, useRef } from 'react';
import { Shield, VolumeX, Menu, X, Ticket, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { passService } from '../services/passService';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  onOpenGoogleAuth: () => void;
  onOpenMyPasses: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGoogleAuth,
  onOpenMyPasses,
  onOpenAdmin,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeLink, setActiveLink] = useState('#hero');
  const [userPassCount, setUserPassCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePassCount = () => {
    if (user?.email) {
      setUserPassCount(passService.getUserPasses(user.email).length);
    } else {
      setUserPassCount(0);
    }
  };

  useEffect(() => {
    setIsAudioActive(soundFx.isEnabled());
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    updatePassCount();
    const handler = () => updatePassCount();
    window.addEventListener('ece_passes_updated', handler);
    return () => window.removeEventListener('ece_passes_updated', handler);
  }, [user?.email]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for mobile menu escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSoundEffects = () => {
    const enabled = soundFx.toggleSound();
    setIsAudioActive(enabled);
  };

  const navLinks = [
    { label: 'Overview',     href: '#hero',         num: '00' },
    { label: 'Architecture', href: '#about',        num: '01' },
    { label: 'Events',       href: '#events',       num: '02' },
    { label: 'Archive',      href: '#gallery',      num: '03' },
    { label: 'Prestige',     href: '#achievements', num: '04' },
    { label: 'Advisors',     href: '#faculty',      num: '05' },
    { label: 'Command',      href: '#team',         num: '06' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-[#04060A]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">

          {/* ── Brand Emblems Capsule ─────────────────────────── */}
          <a
            href="#hero"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-3 group shrink-0"
          >
            {/* Dual Logos Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-midnight-lighter border border-white/15 shadow-sm group-hover:border-lime/50 transition-all duration-300">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0B101E] border border-amber-500/30 p-1 flex items-center justify-center">
                <img
                  src="/space_logo.webp"
                  alt="SPACE"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(255,184,0,0.6)]"
                />
              </div>
              <span className="text-slate-600 text-[10px] font-mono font-bold">×</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0B101E] border border-lime/30 p-1 flex items-center justify-center">
                <img
                  src="/sinc_logo.webp"
                  alt="SINC"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(0,242,254,0.6)]"
                />
              </div>
            </div>

            {/* Department Label */}
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="font-space font-extrabold text-sm tracking-wider text-white group-hover:text-lime transition-colors">
                  ECE FORUM
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-lime/10 border border-lime/30 text-lime font-bold">
                  2026-27
                </span>
              </div>
              <span className="block text-[10px] font-mono text-slate-400">
                PIET · SPACE &amp; SINC
              </span>
            </div>
          </a>

          {/* ── Desktop Interactive Navigation Capsule ─────────── */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-[#060A14]/80 border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {navLinks.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveLink(link.href);
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white font-bold bg-white/10 shadow-sm border border-white/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-[9px] text-lime/60 font-semibold">{link.num}</span>
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* ── Desktop Action HUD Controls ─────────────────────── */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">

            {/* My Passes Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenMyPasses();
              }}
              id="my-passes-nav-btn"
              className="px-3 py-1.5 rounded-xl bg-midnight-lighter border border-white/10 hover:border-lime/50 text-slate-300 hover:text-lime text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
              title="My Registered Event Passes"
            >
              <Ticket className="w-3.5 h-3.5 text-lime group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline font-bold">MY PASSES</span>
              {userPassCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-lime text-midnight text-[9px] font-black flex items-center justify-center">
                  {userPassCount}
                </span>
              )}
            </button>

            {/* Audio Synthesizer Toggle */}
            <button
              onClick={toggleSoundEffects}
              title={isAudioActive ? 'Sound Feedback: ACTIVE' : 'Enable Audio Feedback'}
              id="audio-toggle-btn"
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                isAudioActive
                  ? 'bg-lime/15 border-lime/50 text-lime shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-midnight-lighter/80 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
              }`}
            >
              {isAudioActive ? (
                <>
                  <div className="flex items-end gap-[2px] h-3.5">
                    <span className="w-[2px] bg-lime eq-bar-1 rounded-full" />
                    <span className="w-[2px] bg-lime eq-bar-2 rounded-full" />
                    <span className="w-[2px] bg-lime eq-bar-3 rounded-full" />
                  </div>
                  <span className="font-bold tracking-wider">SFX</span>
                </>
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Admin Command Console */}
            <button
              onClick={() => { soundFx.playLaser(); onOpenAdmin(); }}
              id="admin-portal-btn"
              className="px-2.5 py-1.5 rounded-xl bg-midnight-lighter/80 border border-white/10 hover:border-amber/50 text-slate-300 hover:text-amber transition-all duration-300 flex items-center gap-1 text-[10px] font-mono cursor-pointer shadow-sm"
              title="Admin Command Console"
            >
              <Shield className="w-3.5 h-3.5 text-amber/70" />
              <span className="hidden lg:inline font-bold">ADMIN</span>
            </button>

            {/* Google Authentication / User Profile Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-1 rounded-2xl bg-midnight-lighter border border-lime/40 hover:border-lime flex items-center gap-2 transition-all cursor-pointer"
                >
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover border border-white/10"
                  />
                  <span className="text-xs font-mono text-white font-bold hidden md:inline max-w-[90px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#060A14] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      <div className="text-[10px] text-lime mt-0.5">{user.rollNumber}</div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenMyPasses();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-xl flex items-center gap-2 text-slate-200 transition-all cursor-pointer mt-1"
                    >
                      <Ticket className="w-3.5 h-3.5 text-lime" />
                      <span>My Registered Passes</span>
                    </button>

                    <div className="border-t border-white/10 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        soundFx.playClick();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-500/15 rounded-xl flex items-center gap-2 text-red-400 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenGoogleAuth();
                }}
                id="google-login-btn"
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-space font-bold text-xs hover:bg-slate-100 transition-all duration-200 flex items-center gap-2 shadow-[0_4px_15px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.1C3.26 21.48 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.1z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.52 1.24 6.59l4.04 3.1c.95-2.84 3.6-4.94 6.72-4.94z"
                  />
                </svg>
                <span>Google Login</span>
              </button>
            )}

          </div>

          {/* ── Mobile Controls ─────────────────────────────────── */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenMyPasses();
              }}
              className="p-2 rounded-xl bg-midnight-lighter border border-white/10 text-lime"
              title="My Passes"
            >
              <Ticket className="w-4 h-4" />
            </button>

            <button
              onClick={() => { soundFx.playClick(); setMobileMenuOpen(!mobileMenuOpen); }}
              id="mobile-menu-btn"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-xl bg-midnight-lighter border border-white/10 text-slate-200 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Cybernetic Drawer ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#04060C]/98 backdrop-blur-3xl border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-lime to-transparent" />
          
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* User status in mobile */}
            {isAuthenticated && user ? (
              <div className="p-3 rounded-2xl bg-midnight border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-lime/40 object-cover"
                  />
                  <div>
                    <div className="font-bold text-white text-xs">{user.name}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[10px] font-mono text-red-400 border border-red-500/30 px-2 py-1 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleAuth();
                }}
                className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-xs font-space flex items-center justify-center gap-2"
              >
                <span>Continue with Google Account</span>
              </button>
            )}

            <div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyPasses();
                }}
                className="w-full p-3 rounded-xl bg-midnight border border-lime/30 text-lime text-xs font-mono font-bold flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>My Registered Passes ({userPassCount})</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/[0.06] flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-[9px] text-lime font-bold">{link.num}</span>
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-3 rounded-xl border border-amber/40 bg-amber/10 text-amber text-xs font-mono font-bold flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Command Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
