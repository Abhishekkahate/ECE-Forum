import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Ticket, ChevronRight, ShieldCheck, 
  Sparkles, Timer, Share2, Check 
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';
import { OptimizedImage } from './OptimizedImage';

export interface EventItem {
  id: string;
  title: string;
  category: 'Installation' | 'Workshop' | 'Competition' | 'Seminar' | string;
  status: 'Upcoming' | 'Past' | 'Ongoing';
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  badge?: string;
  price?: number;
  speaker?: string;
  seatsRemaining?: number;
  totalSeats?: number;
  participationType?: 'individual_only' | 'team_only' | 'both';
}

import { type SiteHeroConfig, DEFAULT_HERO_CONFIG } from '../services/api';

interface EventsSectionProps {
  eventsList?: EventItem[];
  onRegisterClick?: (event: EventItem) => void;
  heroConfig?: SiteHeroConfig;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  eventsList,
  onRegisterClick,
  heroConfig = DEFAULT_HERO_CONFIG,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const revealRef = useScrollReveal(0.06);

  // Robust Target Flagship Countdown Date Parser
  const parseTargetDate = (str?: string) => {
    if (!str) return Date.now() + 14 * 24 * 60 * 60 * 1000;
    try {
      const normalized = str.includes('+') || str.includes('Z') ? str : `${str}+05:30`;
      const time = new Date(normalized).getTime();
      if (!isNaN(time)) return time;
      const fallbackTime = new Date(str).getTime();
      return !isNaN(fallbackTime) ? fallbackTime : Date.now() + 14 * 24 * 60 * 60 * 1000;
    } catch {
      return Date.now() + 14 * 24 * 60 * 60 * 1000;
    }
  };

  const targetDate = parseTargetDate(heroConfig.flagshipTargetDate);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const activeEvents = eventsList !== undefined ? eventsList : [];

  const filteredEvents = activeEvents.filter((evt) => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return evt.status === 'Upcoming';
    if (filter === 'Past') return evt.status === 'Past';
    return evt.category.toLowerCase() === filter.toLowerCase();
  });

  const countdownPads = (n: number) => String(n).padStart(2, '0');

  const handleShareEvent = (evt: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const shareText = `Join ${evt.title} on ${evt.date} at ${evt.venue}! Register: ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShareToast(`Copied invitation for "${evt.title}"`);
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <section
      id="events"
      ref={revealRef}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Gradient Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-midnight-deep border border-amber text-white text-xs font-mono px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(255,184,0,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4 text-cyber-emerald" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Atmospheric Glow */}
      <div className="absolute top-0 right-0 w-[650px] h-[550px] bg-gradient-radial from-amber/[0.04] to-transparent rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              <Ticket className="w-3 h-3" />
              <span>02 // EVENTS &amp; WORKSHOPS</span>
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Event Calendar &amp;
              <br className="hidden sm:block" />
              Live Registration.
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            Department ceremonies, hardware workshops, and hackathons.
          </p>
        </div>

        {/* ── High-Tech Countdown Terminal Banner ─────────────── */}
        <div className="mb-14 reveal stagger-2">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0C1224]/95 via-[#080D1A]/98 to-[#050812] border border-amber/40 overflow-hidden shadow-[0_20px_60px_-15px_rgba(255,184,0,0.2)]">
            
            {/* Top Laser Shimmer */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 relative z-10">
              
              {/* Left: Text Details & Trigger (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber animate-ping shrink-0" />
                  <span>{heroConfig.flagshipBadge || 'Flagship Event'}</span>
                </div>

                <h3 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {heroConfig.flagshipTitle || 'SPACE & SINC Installation'}
                  <br />
                  <span className="text-gradient-amber">{heroConfig.flagshipSubTitle || '& TARANG 2K26'}</span>
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  {heroConfig.flagshipDescription ||
                    'Grand induction of the 2026-27 executive council followed by the freshers tech gala. Join faculty advisors and student engineers.'}
                </p>

                {onRegisterClick && activeEvents.length > 0 && (
                  <button
                    onClick={() => { soundFx.playLaser(); onRegisterClick(activeEvents[0]); }}
                    id="flagship-register-btn"
                    className="btn-amber cursor-pointer group shadow-[0_0_25px_rgba(255,184,0,0.3)] text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{heroConfig.flagshipButtonText || 'Register Now'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Right: Digital LED Segment Countdown Blocks (5 cols) */}
              <div className="lg:col-span-5">
                <div className="flex items-center justify-center lg:justify-end gap-2 sm:gap-3.5">
                  {/* Days */}
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-bold tracking-widest">DAYS</span>
                    <div className="stat-number text-4xl sm:text-5xl text-white bg-midnight-deep border border-white/15 rounded-2xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center shadow-inner">
                      {countdownPads(timeLeft.days)}
                    </div>
                  </div>

                  <span className="text-amber font-mono text-2xl font-bold mt-5 animate-pulse">:</span>

                  {/* Hours */}
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-bold tracking-widest">HOURS</span>
                    <div className="stat-number text-4xl sm:text-5xl text-white bg-midnight-deep border border-white/15 rounded-2xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center shadow-inner">
                      {countdownPads(timeLeft.hours)}
                    </div>
                  </div>

                  <span className="text-amber font-mono text-2xl font-bold mt-5 animate-pulse">:</span>

                  {/* Minutes */}
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-bold tracking-widest">MINS</span>
                    <div className="stat-number text-4xl sm:text-5xl text-white bg-midnight-deep border border-white/15 rounded-2xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center shadow-inner">
                      {countdownPads(timeLeft.minutes)}
                    </div>
                  </div>

                  <span className="text-amber font-mono text-2xl font-bold mt-5 animate-pulse">:</span>

                  {/* Seconds */}
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] text-lime font-bold tracking-widest">SECS</span>
                    <div className="stat-number text-4xl sm:text-5xl text-lime bg-midnight-deep border border-lime/40 rounded-2xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                      {countdownPads(timeLeft.seconds)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center lg:text-right">
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center justify-center lg:justify-end gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-amber" />
                    TARGET: {(heroConfig.flagshipTargetDate || 'JULY 30, 2026 10:00 AM IST').replace('T', ' · ')} · {heroConfig.flagshipTargetVenue || 'AUDITORIUM'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Filter Pills Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 reveal">
          {(['All', 'Upcoming', 'Past', 'Workshop', 'Competition', 'Seminar', 'Installation'] as const).map((cat) => {
            const count = cat === 'All' 
              ? activeEvents.length 
              : activeEvents.filter(e => e.category === cat || e.status === cat).length;
            if (count === 0 && cat !== 'All' && cat !== 'Upcoming' && cat !== 'Workshop') return null;

            return (
              <button
                key={cat}
                onClick={() => { soundFx.playClick(); setFilter(cat); }}
                id={`event-filter-${cat.toLowerCase()}`}
                className={`filter-pill flex items-center gap-1.5 ${filter === cat ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === cat ? 'bg-midnight text-white font-bold' : 'bg-white/10 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                evt={evt}
                onRegisterClick={onRegisterClick}
                onShareClick={(e) => handleShareEvent(evt, e)}
                className="animate-in fade-in duration-300"
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-midnight/50 p-8 space-y-2.5">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="font-space font-bold text-white text-base">No Scheduled Events</h4>
              <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                No active events in this category. Check back soon for upcoming hackathons, workshops, and ceremonies!
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

interface EventCardProps {
  evt: EventItem;
  onRegisterClick?: (event: EventItem) => void;
  onShareClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ evt, onRegisterClick, onShareClick, className = '' }) => {
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=20260730T043000Z/20260730T103000Z&details=${encodeURIComponent(evt.description)}&location=${encodeURIComponent(evt.venue)}`;

  return (
    <div
      onMouseEnter={() => soundFx.playHover()}
      className={`glass-cyber-interactive rounded-3xl overflow-hidden flex flex-col justify-between group shadow-xl ${className}`}
    >
      {/* Top Banner Image with Badges */}
      <div className="relative aspect-[16/9] overflow-hidden bg-midnight-deep">
        <OptimizedImage
          src={evt.image}
          alt={evt.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060A] via-[#04060A]/40 to-transparent" />

        {/* Badge */}
        <div className="absolute top-3.5 left-3.5 bg-midnight-deep/90 border border-white/20 backdrop-blur-md px-3 py-1 rounded-xl shadow-md">
          <span className="text-[9px] font-mono font-extrabold text-white tracking-widest">{evt.badge}</span>
        </div>

        {/* Share & Calendar Icons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noreferrer"
            title="Add to Google Calendar"
            className="p-2 rounded-xl bg-midnight-deep/90 border border-white/15 text-slate-300 hover:text-white hover:border-lime/50 backdrop-blur-md transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
          </a>
          {onShareClick && (
            <button
              onClick={onShareClick}
              title="Share Invitation"
              className="p-2 rounded-xl bg-midnight-deep/90 border border-white/15 text-slate-300 hover:text-amber hover:border-amber-400/50 backdrop-blur-md transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Chip */}
        <div className="absolute bottom-3.5 right-3.5 bg-midnight-deep/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber" />
          <span className="text-[10px] font-mono text-slate-200 font-semibold">{evt.date}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 space-y-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-lime">
              <Clock className="w-3.5 h-3.5" />
              {evt.time}
            </span>
            {evt.participationType === 'individual_only' ? (
              <span className="text-[9px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-md font-bold">
                👤 Solo Only
              </span>
            ) : evt.participationType === 'team_only' ? (
              <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                👥 Team (2-5)
              </span>
            ) : (
              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                👥 Solo / Team
              </span>
            )}
            <span className="flex items-center gap-1 text-amber">
              <MapPin className="w-3.5 h-3.5" />
              {evt.venue}
            </span>
          </div>

          <h3 className="font-space font-extrabold text-lg text-white leading-snug line-clamp-2 group-hover:text-lime transition-colors">
            {evt.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
            {evt.description}
          </p>
        </div>

        {/* Live Seats Remaining Bar if upcoming */}
        {evt.seatsRemaining !== undefined && evt.totalSeats !== undefined && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-amber" />
                <span>LIMITED CAPACITY</span>
              </span>
              <span className="text-amber font-bold">{evt.seatsRemaining} SEATS LEFT</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-midnight-deep border border-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-lime via-amber to-amber-500 rounded-full"
                style={{ width: `${Math.max(15, (1 - evt.seatsRemaining / evt.totalSeats) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Registration Action */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-500 block tracking-widest uppercase">ADMISSION FEE</span>
            <span className="text-sm font-mono font-extrabold text-white">
              {evt.price && evt.price > 0 ? `₹${evt.price} INR` : 'FREE Entry'}
            </span>
          </div>
          {onRegisterClick ? (
            <button
              onClick={() => { soundFx.playLaser(); onRegisterClick(evt); }}
              id={`register-btn-${evt.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-midnight font-space font-extrabold text-xs tracking-wider hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Register</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 tracking-widest">{evt.status}</span>
          )}
        </div>
      </div>
    </div>
  );
};
