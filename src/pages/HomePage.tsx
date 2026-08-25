import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { MarqueeTicker } from '../components/MarqueeTicker';
import { AboutSection } from '../components/AboutSection';
import { EventsSection, type EventItem } from '../components/EventsSection';
import { GallerySection, type GalleryItem } from '../components/GallerySection';
import { AchievementsSection } from '../components/AchievementsSection';
import { FacultySection } from '../components/FacultySection';
import { TeamSection } from '../components/TeamSection';
import { ContactFooter } from '../components/ContactFooter';
import { ScrollToTopFab } from '../components/ScrollToTopFab';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { MyPassesModal } from '../components/MyPassesModal';
import { type SiteHeroConfig } from '../services/api';

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
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
    spotlightRef.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
  };

  const handleRegisterEvent = (evt: EventItem) => {
    navigate(`/register?event=${evt.id}`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="min-h-screen bg-[#030508] text-slate-100 relative selection:bg-lime selection:text-midnight overflow-x-hidden font-sans"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] bg-radial-spotlight rounded-full blur-3xl opacity-30 z-30 transition-transform duration-75 ease-out hidden md:block"
        style={{ willChange: 'transform' }}
      />

      {/* Persistent HUD Navigation */}
      <Navbar
        onOpenGoogleAuth={() => setIsAuthOpen(true)}
        onOpenMyPasses={() => setIsMyPassesOpen(true)}
        onOpenAdmin={() => navigate('/admin')}
      />

      {/* Main Structural Layout */}
      <main className="relative z-10 space-y-0">
        {/* Monumental Hero Showcase & Silicon Core */}
        <HeroSection
          heroConfig={heroConfig}
          onExploreEvents={() => {
            const el = document.getElementById('events');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onJoinCommunity={() => {
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Live News Ticker Marquee with Live Backend Broadcast Support */}
        <MarqueeTicker customAnnouncement={announcement} />

        {/* About Forum, Vision, Mission & Dual Councils */}
        <AboutSection />

        {/* Events, Live Countdown & Dedicated Registration Navigation */}
        <EventsSection
          heroConfig={heroConfig}
          eventsList={eventsList}
          onRegisterClick={handleRegisterEvent}
        />

        {/* Media Archive & Event Gallery */}
        <GallerySection galleryItems={galleryList} />

        {/* Wall of Fame & Achievements */}
        <AchievementsSection />

        {/* Faculty Mentors & Leadership */}
        <FacultySection />

        {/* Student Executive Committee */}
        <TeamSection />
      </main>

      {/* Contact & Footer */}
      <ContactFooter />

      {/* Floating Scroll-to-Top and Quick Jump HUD */}
      <ScrollToTopFab />

      {/* Interactive Modals */}
      {isAuthOpen && (
        <GoogleAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {isMyPassesOpen && (
        <MyPassesModal
          isOpen={isMyPassesOpen}
          onClose={() => setIsMyPassesOpen(false)}
          onOpenGoogleAuth={() => {
            setIsMyPassesOpen(false);
            setIsAuthOpen(true);
          }}
          onExploreEvents={() => {
            setIsMyPassesOpen(false);
            const el = document.getElementById('events');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};
