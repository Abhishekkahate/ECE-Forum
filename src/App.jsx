import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
  Hexagon, Activity, Layers, Calendar, Image as ImageIcon,
  Trophy, BookOpen, Users, Send, Search, Command, ArrowUp,
  Check, Sparkles
} from 'lucide-react';
import { forumApi, DEFAULT_HERO_CONFIG } from './services/api';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import DeveloperPage from './pages/DeveloperPage';
import { HomePage } from './pages/HomePage';
import { useAuth } from './context/AuthContext';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { MyPassesModal } from './components/MyPassesModal';
import { DEFAULT_GALLERY_ITEMS } from './components/GallerySection';

// --- MOBILE FLOATING GLASS DOCK (Mobile Bottom Quick Bar) ---
function MobileDock() {
  const [visible, setVisible] = useState(false);
  const items = [
    { id: '#hero', label: 'Home', icon: Hexagon },
    { id: '#about', label: 'Atelier', icon: Layers },
    { id: '#events', label: 'Events', icon: Calendar },
    { id: '#gallery', label: 'Archive', icon: ImageIcon },
    { id: '#team', label: 'Team', icon: Users },
  ];

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    try { navigator.vibrate?.(8); } catch {}
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-x-0 z-40 lg:hidden flex justify-center pointer-events-none transition-all duration-300"
      style={{
        bottom: 'max(14px, calc(env(safe-area-inset-bottom) + 10px))',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(80px)'
      }}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-[rgba(8,12,18,0.9)] backdrop-blur-3xl border border-white/[0.1] shadow-glass-xl"
        aria-label="Quick navigation"
      >
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              aria-label={it.label}
              className="w-10 h-10 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10 active:bg-[#FF4A15] active:text-black transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <span className="w-px h-5 bg-white/12 mx-0.5" />
        <button
          onClick={() => {
            try { navigator.vibrate?.(8); } catch {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Back to top"
          className="w-10 h-10 rounded-full grid place-items-center text-[#FF4A15] hover:bg-white/10 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}

// --- COMMAND PALETTE (âŒ˜K / Ctrl+K) ---
function CommandPalette({ open, setOpen }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const items = [
    { id: '#hero', label: 'Overview â€” Hero & Silicon Core', icon: Hexagon, kbd: '0' },
    { id: '#about', label: 'Dual Council â€” SPACE Ã— SINC', icon: Layers, kbd: '1' },
    { id: '#stats', label: 'Department Telemetry â€” Metrics', icon: Activity, kbd: '2' },
    { id: '#events', label: 'Events & Registration â€” Live Calendar', icon: Calendar, kbd: '3' },
    { id: '#gallery', label: 'Visual Archive â€” Labs & Hackathons', icon: ImageIcon, kbd: '4' },
    { id: '#achievements', label: 'Prestige â€” Patents & Trophies', icon: Trophy, kbd: '5' },
    { id: '#faculty', label: 'Academic Board â€” Faculty Leadership', icon: BookOpen, kbd: '6' },
    { id: '#team', label: 'Command Council â€” 30 Student Leaders', icon: Users, kbd: '7' },
    { id: '#contact', label: 'Dispatch & Coordinates â€” Contact', icon: Send, kbd: '8' },
  ];

  const filtered = q.trim()
    ? items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
    : items;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setSel(0);
      setQ('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => (s + 1) % filtered.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => (s - 1 + filtered.length) % filtered.length);
      }
      if (e.key === 'Enter') {
        const it = filtered[sel];
        if (it) {
          setOpen(false);
          document.querySelector(it.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel, setOpen]);

  if (!open) return null;

  return (
    <div
        className="fixed inset-0 z-[110] flex items-start justify-center pt-[12vh] sm:pt-[18vh] p-4 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[600px] rounded-[28px] bg-[rgba(10,14,20,0.97)] border border-white/[0.12] shadow-glass-xl overflow-hidden backdrop-blur-3xl"
      >
        <div className="flex items-center gap-3 px-5 h-[56px] border-b border-white/10">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to sectionâ€¦ (type 'patent', 'team', 'events')"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35 font-sans"
          />
          <span className="hidden sm:inline-flex items-center text-[10.5px] font-mono text-white/40 border border-white/10 rounded-full px-2 py-0.5">
            ESC
          </span>
        </div>

        <div className="p-2 max-h-[50dvh] overflow-y-auto space-y-1">
          {filtered.length ? (
            filtered.map((it, idx) => {
              const Icon = it.icon;
              const active = idx === sel;
              return (
                <button
                  key={it.id}
                  onMouseEnter={() => setSel(idx)}
                  onClick={() => {
                    setOpen(false);
                    document.querySelector(it.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                    active
                      ? 'bg-[#FF4A15] text-black font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl grid place-items-center border shrink-0 ${
                      active ? 'bg-black/10 border-black/15 text-black' : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-xs sm:text-sm truncate">{it.label}</span>
                  <span
                    className={`hidden sm:inline-flex w-6 h-6 rounded-full border text-[10px] font-mono font-bold items-center justify-center shrink-0 ${
                      active ? 'border-black/20 text-black' : 'bg-white/5 border-white/10 text-white/35'
                    }`}
                  >
                    {it.kbd}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs font-mono text-white/40">No sections found for â€œ{q}â€</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- GLOBAL TOAST SYSTEM ---
function GlobalToast({ toasts }) {
  return (
    <div
      className="fixed left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[120] space-y-2 pointer-events-none"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto px-4 py-3 rounded-2xl border backdrop-blur-3xl shadow-glass-xl flex items-start gap-3 text-sm ${
              t.type === 'success'
                ? 'bg-[rgba(10,20,16,0.95)] border-emerald-500/30 text-white'
                : t.type === 'error'
                ? 'bg-[rgba(24,10,10,0.95)] border-red-500/30 text-white'
                : 'bg-[rgba(10,14,20,0.95)] border-white/[0.12] text-white'
            }`}
          >
            <span
              className={`mt-0.5 w-6 h-6 rounded-full grid place-items-center shrink-0 ${
                t.type === 'success'
                  ? 'bg-emerald-400 text-black'
                  : t.type === 'error'
                  ? 'bg-red-400 text-black'
                  : 'bg-[#FF4A15] text-black'
              }`}
            >
              {t.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </span>
            <div className="flex-1 leading-snug">
              <div className="font-bold text-[13px]">{t.title}</div>
              <div className="text-xs text-white/60 mt-0.5">{t.msg}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- DEFAULT INITIAL STATE FALLBACKS ---
const DEFAULT_INITIAL_EVENTS = [
  {
    id: 'evt-tarang-2026',
    title: 'SPACE & SINC Forum Installation Ceremony & TARANG 2K26',
    category: 'Installation',
    status: 'Upcoming',
    date: 'August 30, 2026',
    time: '10:00 AM IST',
    venue: 'PIET Main Auditorium',
    description: 'Grand induction of the 2026-27 departmental council followed by the freshers gala, technical showcases, and awards.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    badge: 'FLAGSHIP CEREMONY',
    price: 150,
    totalSeats: 250,
    seatsRemaining: 84,
    participationType: 'both',
  },
  {
    id: 'evt-riscv-sprint',
    title: 'RISC-V Custom SoC & FPGA Verilog Bootcamp',
    category: 'Workshop',
    status: 'Upcoming',
    date: 'September 12, 2026',
    time: '11:00 AM IST',
    venue: 'VLSI Silicon Lab Â· PIET',
    description: 'Hands-on 32-bit RISC-V core design, pipeline simulation, and Xilinx Artix-7 FPGA synthesis.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80',
    badge: 'HANDS-ON LAB',
    price: 200,
    totalSeats: 60,
    seatsRemaining: 18,
    participationType: 'individual_only',
  },
  {
    id: 'evt-rover-hackathon',
    title: '24-Hour Autonomous LiDAR Rover Hackathon',
    category: 'Competition',
    status: 'Upcoming',
    date: 'September 26, 2026',
    time: '09:00 AM IST',
    venue: 'Robotics Arena Â· SINC Lab',
    description: 'Build and race autonomous rovers through obstacle mazes using ROS 2, LiDAR sensors, and camera telemetry.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80',
    badge: 'â‚¹50,000 PRIZE',
    price: 400,
    totalSeats: 40,
    seatsRemaining: 9,
    participationType: 'team_only',
  },
];

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);

  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [showMyPasses, setShowMyPasses] = useState(false);

  // Backend Live State
  const [eventsList, setEventsList] = useState(DEFAULT_INITIAL_EVENTS);
  const [galleryList, setGalleryList] = useState(DEFAULT_GALLERY_ITEMS);
  const [heroConfig, setHeroConfig] = useState(DEFAULT_HERO_CONFIG);
  const [announcement, setAnnouncement] = useState('');

  const pushToast = (title, msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  // Lenis Hardware-Accelerated Smooth Momentum Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    if (typeof window !== 'undefined') {
      window.__lenis = lenis;
    }

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (typeof window !== 'undefined') {
        delete window.__lenis;
      }
    };
  }, []);

  // Backend Data Sync
  useEffect(() => {
    const loadData = async () => {
      try {
        const [remoteEvents, remoteAnn, remoteHero, remoteGallery] = await Promise.all([
          forumApi.getEvents().catch(() => null),
          forumApi.getAnnouncement().catch(() => null),
          forumApi.getSiteHeroConfig().catch(() => null),
          forumApi.getGalleryItems().catch(() => null),
        ]);

        if (Array.isArray(remoteEvents)) {
          setEventsList(
            remoteEvents.map((e) => ({
              id: e.id,
              title: e.title,
              category: e.category,
              status: e.status,
              date: e.date,
              time: e.time || '10:00 AM IST',
              venue: e.venue,
              description: e.description,
              badge: e.badge || 'EVENT',
              price: Number(e.price) || 0,
              totalSeats: e.totalSeats || 100,
              seatsRemaining: Math.floor((e.totalSeats || 100) * 0.4),
              image: e.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
              participationType: e.participationType || 'both',
              minTeamSize: e.minTeamSize || 2,
              maxTeamSize: e.maxTeamSize || 5,
              requiredTeamSize: e.requiredTeamSize || undefined,
            }))
          );
        }
        if (typeof remoteAnn === 'string' && remoteAnn) setAnnouncement(remoteAnn);
        if (remoteHero && typeof remoteHero === 'object') setHeroConfig((prev) => ({ ...prev, ...remoteHero }));
        if (Array.isArray(remoteGallery) && remoteGallery.length) setGalleryList(remoteGallery);
      } catch (err) {
        console.warn('Backend sync note:', err);
      }
    };

    loadData();

    const handleHeroUpdate = (e) => {
      if (e.detail) setHeroConfig((prev) => ({ ...prev, ...e.detail }));
    };

    const handleEventsUpdate = (e) => {
      if (e.detail?.deletedId) {
        setEventsList((prev) => prev.filter((item) => item.id !== e.detail.deletedId));
      }
      loadData();
    };

    window.addEventListener('ece_hero_config_updated', handleHeroUpdate);
    window.addEventListener('ece_events_updated', handleEventsUpdate);

    const iv = setInterval(loadData, 10000);
    return () => {
      clearInterval(iv);
      window.removeEventListener('ece_hero_config_updated', handleHeroUpdate);
      window.removeEventListener('ece_events_updated', handleEventsUpdate);
    };
  }, []);

  // Global Keyboard Shortcuts (âŒ˜K, Escape)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if (e.key === 'Escape' && cmdOpen) setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cmdOpen]);

  return (
    <div className="relative min-h-screen bg-[#030508] text-white selection:bg-[#FF4A15]/30 selection:text-white overflow-x-clip">
      {/* Global Toast Alerts */}
      <GlobalToast toasts={toasts} />

      {/* Floating âŒ˜K Trigger Button for Desktop */}
      {!cmdOpen && (
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden lg:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-30 items-center gap-2 px-4 py-2 rounded-full bg-[rgba(8,12,18,0.9)] border border-white/[0.1] text-xs font-mono text-white/60 hover:text-white hover:border-[#FF4A15]/40 transition-all duration-300 shadow-glass-md backdrop-blur-3xl group"
        >
          <Command className="w-3.5 h-3.5 text-[#FF4A15]" />
          <span>Press</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10.5px]">âŒ˜ K</span>
          <span>to navigate</span>
        </button>
      )}

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      {/* Mobile Floating Quick Dock */}
      <MobileDock />

      {/* Application Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              eventsList={eventsList}
              heroConfig={heroConfig}
              announcement={announcement}
              galleryList={galleryList}
              isAuthOpen={showGoogleAuth}
              setIsAuthOpen={setShowGoogleAuth}
              isMyPassesOpen={showMyPasses}
              setIsMyPassesOpen={setShowMyPasses}
            />
          }
        />
        <Route path="/register" element={<RegisterPage eventsList={eventsList} />} />
        <Route path="/register/:eventId" element={<RegisterPage eventsList={eventsList} />} />
        <Route
          path="/admin"
          element={
            <AdminPage
              eventsList={eventsList}
              onAddEvent={async (newEvent) => {
                setEventsList((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
                await forumApi.createEvent(newEvent).catch(() => {});
              }}
              onUpdateEvents={setEventsList}
              onUpdateAnnouncement={async (notice) => {
                setAnnouncement(notice);
                await forumApi.setAnnouncement(notice).catch(() => {});
              }}
              currentAnnouncement={announcement}
              heroConfig={heroConfig}
              onUpdateHeroConfig={async (cfg) => {
                setHeroConfig(cfg);
                await forumApi.updateSiteHeroConfig(cfg).catch(() => {});
              }}
              galleryList={galleryList}
              onUpdateGallery={async (g) => {
                setGalleryList(g);
                await forumApi.updateGalleryItems(g).catch(() => {});
              }}
            />
          }
        />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals */}
      {showGoogleAuth && (
        <GoogleAuthModal
          isOpen={showGoogleAuth}
          onClose={() => setShowGoogleAuth(false)}
          onSuccess={() => {
            setShowGoogleAuth(false);
            pushToast('Welcome!', 'Google sign-in successful', 'success');
          }}
        />
      )}

      {showMyPasses && (
        <MyPassesModal
          isOpen={showMyPasses}
          onClose={() => setShowMyPasses(false)}
          onOpenGoogleAuth={() => {
            setShowMyPasses(false);
            setShowGoogleAuth(true);
          }}
          onExploreEvents={() => {
            setShowMyPasses(false);
            document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
