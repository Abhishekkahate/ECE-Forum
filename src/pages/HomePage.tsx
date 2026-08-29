import React, { useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ScrollToTopFab } from '../components/ScrollToTopFab';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { MyPassesModal } from '../components/MyPassesModal';
import { type SiteHeroConfig } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { EventItem } from '../components/EventsSection';
import type { GalleryItem } from '../components/GallerySection';

const AboutSection = lazy(() => import('../components/AboutSection').then(m => ({ default: m.AboutSection })));
const StatsSection = lazy(() => import('../components/StatsSection').then(m => ({ default: m.StatsSection })));
const EventsSection = lazy(() => import('../components/EventsSection').then(m => ({ default: m.EventsSection })));
const GallerySection = lazy(() => import('../components/GallerySection').then(m => ({ default: m.GallerySection })));
const AchievementsSection = lazy(() => import('../components/AchievementsSection').then(m => ({ default: m.AchievementsSection })));
const FacultySection = lazy(() => import('../components/FacultySection').then(m => ({ default: m.FacultySection })));
const TeamSection = lazy(() => import('../components/TeamSection').then(m => ({ default: m.TeamSection })));
const ContactFooter = lazy(() => import('../components/ContactFooter').then(m => ({ default: m.ContactFooter })));

// lightweight fallback — avoids layout shift
const SectionFallback: React.FC = () => (
  <div className="py-16 lg:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-6 w-32 rounded-full bg-white/[0.04] border border-white/[0.06] animate-pulse" />
      <div className="mt-6 h-10 w-64 rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
    </div>
  </div>
);

interface HomePageProps {
  eventsList: EventItem[];
  heroConfig: SiteHeroConfig;
  announcement: string;
  galleryList: GalleryItem[];
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isMyPassesOpen: boolean;
  setIsMyPassesOpen: (open: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  eventsList,
  heroConfig,
  announcement,
  galleryList,
  isAuthOpen,
  setIsAuthOpen,
  isMyPassesOpen,
  setIsMyPassesOpen,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const pointerRaf = useRef<number>(0);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    pendingPos.current = { x: e.clientX, y: e.clientY };
    if (pointerRaf.current) return;
    pointerRaf.current = requestAnimationFrame(() => {
      pointerRaf.current = 0;
      const p = pendingPos.current;
      if (!p || !spotlightRef.current) return;
      spotlightRef.current.style.transform = `translate3d(${p.x - 360}px, ${p.y - 360}px, 0)`;
    });
  };

  const handleRegisterEvent = (evt: EventItem) => {
    if (!isAuthenticated) { setIsAuthOpen(true); return; }
    navigate(`/register?event=${evt.id}`);
  };

  const scrollToSection = (targetId: string) => {
    const el = document.querySelector(targetId);
    if (!el) return;
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(el, { offset: -70, duration: 1.15 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="min-h-screen bg-[#08080A] text-[#F5F3EF] relative selection:bg-[#FF4A15] selection:text-white overflow-x-hidden font-sans antialiased"
    >
      <div className="grain" aria-hidden />
      {/* Atelier mesh — visible atelier texture (not plain black) */}
      <div className="mesh-blob mesh-blob-signal w-[960px] h-[760px] -top-[220px] left-[28%] opacity-[0.58]" />
      <div className="mesh-blob mesh-blob-cyan w-[820px] h-[820px] top-[42%] -right-[260px] opacity-[0.42]" />
      <div className="mesh-blob mesh-blob-violet w-[720px] h-[720px] top-[78%] -left-[200px] opacity-[0.36]" />
      {/* Blueprint grid — clearly visible */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.14] editorial-grid" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(1200px_circle_at_50%_0%,_rgba(255,74,21,0.11),_transparent_68%)]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(900px_circle_at_88%_28%,_rgba(0,229,204,0.08),_transparent_62%)]" aria-hidden />
      {/* subtle vignette + base texture */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(1400px_circle_at_50%_120%,_rgba(255,74,21,0.06),_transparent_62%)]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.08) 1px, transparent 1px)', backgroundSize: '120px 120px' }} aria-hidden />
      {/* Interactive spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed top-0 left-0 w-[720px] h-[720px] rounded-full blur-[1.5px] opacity-[0.9] z-[6] transition-transform duration-75 ease-out hidden lg:block"
        style={{
          willChange: 'transform',
          background: 'radial-gradient(360px circle at center, rgba(255,74,21,0.065), transparent 72%)',
        }}
      />

      <Navbar
        onOpenGoogleAuth={() => setIsAuthOpen(true)}
        onOpenMyPasses={() => setIsMyPassesOpen(true)}
        onOpenAdmin={() => navigate('/admin')}
      />

      <main className="relative z-10">
        <HeroSection
          heroConfig={heroConfig}
          onExploreEvents={() => scrollToSection('#events')}
          onJoinCommunity={() => scrollToSection('#about')}
        />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
          <StatsSection />
          <EventsSection heroConfig={heroConfig} eventsList={eventsList} onRegisterClick={handleRegisterEvent} />
          <GallerySection galleryItems={galleryList} />
          <AchievementsSection />
          <FacultySection />
          <TeamSection />
        </Suspense>
      </main>

      <Suspense fallback={<div className="h-32" />}>
        <ContactFooter />
      </Suspense>
      <ScrollToTopFab />

      {isAuthOpen && <GoogleAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
      {isMyPassesOpen && (
        <MyPassesModal
          isOpen={isMyPassesOpen}
          onClose={() => setIsMyPassesOpen(false)}
          onOpenGoogleAuth={() => { setIsMyPassesOpen(false); setIsAuthOpen(true); }}
          onExploreEvents={() => { setIsMyPassesOpen(false); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }}
        />
      )}
    </div>
  );
};
