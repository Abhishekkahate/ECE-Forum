import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Clock, MapPin, ChevronRight, ChevronLeft, ShieldCheck, Timer,
  Share2, Check, Sparkles, ArrowUpRight, Search, Hash, Layers, Grid, Film, Users, User, QrCode
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';
import { OptimizedImage } from './OptimizedImage';
import { type SiteHeroConfig, DEFAULT_HERO_CONFIG } from '../services/api';

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
  minTeamSize?: number;
  maxTeamSize?: number;
  requiredTeamSize?: number;
  paymentQr?: string;
  upiId?: string;
  payeeName?: string;
  paymentInstructions?: string;
}

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
  const [viewLayout, setViewLayout] = useState<'runway' | 'grid'>('runway');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const revealRef = useScrollReveal(0.06);

  const parseTargetDate = (str?: string) => {
    if (!str) return Date.now() + 14 * 24 * 60 * 60 * 1000;
    try {
      const normalized = str.includes('+') || str.includes('Z') ? str : `${str}+05:30`;
      let time = new Date(normalized).getTime();
      if (!isNaN(time)) return time;
      time = new Date(str).getTime();
      return !isNaN(time) ? time : Date.now() + 14 * 24 * 60 * 60 * 1000;
    } catch {
      return Date.now() + 14 * 24 * 60 * 60 * 1000;
    }
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const currentTarget = parseTargetDate(heroConfig.flagshipTargetDate);
      const diff = currentTarget - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [heroConfig.flagshipTargetDate]);

  const activeEvents = eventsList ?? [];
  const filteredEvents = activeEvents.filter((evt) => {
    const matchesFilter =
      filter === 'All'
        ? true
        : filter === 'Upcoming'
        ? evt.status === 'Upcoming'
        : filter === 'Past'
        ? evt.status === 'Past'
        : evt.category.toLowerCase() === filter.toLowerCase();
    
    const matchesSearch =
      searchQuery.trim() === '' ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pad = (n: number) => String(n).padStart(2, '0');

  const handleShare = (evt: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const text = `Join ${evt.title} on ${evt.date} at ${evt.venue}! ${window.location.origin}`;
    navigator.clipboard?.writeText(text);
    setShareToast(`Link copied — "${evt.title}"`);
    setTimeout(() => setShareToast(null), 2500);
  };

  const scrollRunway = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftPos.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const onMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const categories = ['All', 'Upcoming', 'Workshop', 'Competition', 'Seminar', 'Past'] as const;

  return (
    <section id="events" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden">
      <div className="absolute inset-0 editorial-grid opacity-[0.04] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[640px] h-[480px] -top-28 -right-36 opacity-[0.22]" />
      <div className="mesh-blob mesh-blob-cyan w-[520px] h-[520px] -bottom-20 -left-20 opacity-[0.10]" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[rgba(16,16,18,0.96)] border border-white/[0.10] text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-glass-xl backdrop-blur-3xl">
          <span className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center shrink-0"><Check className="w-3.5 h-3.5" /></span>
          {shareToast}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10 mb-10">
          <div className="reveal max-w-[640px]">
            <div className="section-eyebrow-hud">
              <Layers className="w-3.5 h-3.5" /> 03 — EVENTS &amp; REGISTRATION
            </div>
            <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.045em] leading-[0.88] text-[34px] sm:text-[42px] lg:text-[48px] text-[#F5F3EF]">
              Calendar &amp; <span className="font-[Instrument_Serif] italic font-[400] text-[#FF4A15]">live registration.</span>
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.07] px-3 py-1 text-white/60">
                <Hash className="w-3 h-3 text-[#FF4A15]" /> {activeEvents.length} CATALOGUED
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE ENROLLMENT ACTIVE
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* View layout toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#0F0F11] border border-white/[0.08]">
              <button
                onClick={() => { soundFx.playClick(); setViewLayout('runway'); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  viewLayout === 'runway'
                    ? 'bg-[#FF4A15] text-white font-bold shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Horizontal Runway"
              >
                <Film className="w-3.5 h-3.5" /> Runway
              </button>
              <button
                onClick={() => { soundFx.playClick(); setViewLayout('grid'); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  viewLayout === 'grid'
                    ? 'bg-[#FF4A15] text-white font-bold shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Bento Grid"
              >
                <Grid className="w-3.5 h-3.5" /> Bento Grid
              </button>
            </div>
          </div>
        </div>

        {/* Flagship Spotlight Banner */}
        <div className="reveal stagger-1 mb-10 rounded-[28px] overflow-hidden bg-[rgba(16,16,18,0.85)] border border-white/[0.08] backdrop-blur-2xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A15] text-white px-3.5 py-1 font-bold tracking-[0.06em] shadow-[0_0_16px_rgba(255,74,21,0.4)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> {heroConfig.flagshipBadge || 'FLAGSHIP DOSSIER'}
                  </span>
                  <span className="text-white/40 tracking-[0.08em] font-mono">FILE REF: TARANG-2K26</span>
                </div>

                <h3 className="font-[Syne] font-[800] tracking-[-0.035em] leading-[0.92] text-[28px] sm:text-[34px] lg:text-[38px] text-[#F5F3EF]">
                  {heroConfig.flagshipTitle || 'SPACE & SINC Installation'}
                  <br />
                  <span className="font-[Instrument_Serif] italic font-[400] text-[#FF4A15]">
                    {heroConfig.flagshipSubTitle || '& TARANG 2K26'}
                  </span>
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-white/60 max-w-[560px]">
                  {heroConfig.flagshipDescription || 'Grand induction of the 2026—27 council followed by freshers welcome gala, technical showcases, and awards.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {[
                  { k: 'SCHEDULED DATE', v: (heroConfig.flagshipTargetDate || '2026-07-30').slice(0,10), sub: '09:45 AM IST' },
                  { k: 'CENTRAL VENUE', v: heroConfig.flagshipTargetVenue || 'AUDITORIUM', sub: 'PIET CAMPUS' },
                  { k: 'COUNCIL EDITION', v: '14TH EDITION', sub: 'ESTD 2012' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-[9.5px] font-mono tracking-[0.12em] text-white/35 uppercase">{s.k}</div>
                    <div className="mt-1 font-mono font-bold text-[13px] text-white leading-none truncate">{s.v}</div>
                    <div className="text-[10px] font-mono text-white/40 mt-1 leading-none truncate">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {onRegisterClick && activeEvents.length > 0 && (
                  <button
                    onClick={() => { soundFx.playLaser(); onRegisterClick(activeEvents[0]); }}
                    className="btn-signal !px-7 !py-3 !text-[13px] font-bold shadow-xl cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{heroConfig.flagshipButtonText || 'Register for Flagship'}</span>
                    <ChevronRight className="w-4 h-4 opacity-80 relative z-10" />
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> INSTANT DIGITAL PASS &amp; QR
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative bg-[#0A0A0C] lg:border-l border-white/[0.06] p-6 sm:p-8 flex flex-col justify-center gap-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4A15]/[0.05] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.14em] text-white/40 uppercase">
                  <Timer className="w-4 h-4 text-[#FF4A15]" /> OFFICIAL COUNTDOWN
                </span>
                <span className="text-[10px] font-mono tracking-[0.10em] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  LIVE SYNC
                </span>
              </div>

              <div className="relative grid grid-cols-4 gap-2.5">
                {[
                  { k: 'DAYS', v: pad(timeLeft.days) },
                  { k: 'HOURS', v: pad(timeLeft.hours) },
                  { k: 'MINS', v: pad(timeLeft.minutes) },
                  { k: 'SECS', v: pad(timeLeft.seconds), accent: true },
                ].map((b) => (
                  <div key={b.k} className="text-center">
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/30 mb-1">{b.k}</div>
                    <div
                      className={`h-14 sm:h-[58px] rounded-2xl grid place-items-center font-mono font-[800] text-[22px] sm:text-[24px] tracking-[-0.03em] border transition-all ${
                        b.accent
                          ? 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_0_24px_rgba(255,74,21,0.4)]'
                          : 'bg-white/[0.04] border-white/[0.08] text-white'
                      }`}
                    >
                      {b.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-mono text-white/70 truncate">
                  <Calendar className="w-4 h-4 text-[#FF4A15] shrink-0" />
                  <span className="truncate">{(heroConfig.flagshipTargetDate || '2026-07-30T09:45:00').replace('T', ' · ')}</span>
                </span>
                <span className="shrink-0 text-[11px] font-mono px-3 py-1 rounded-full bg-white text-[#08080A] font-bold">
                  {heroConfig.flagshipTargetVenue || 'AUDITORIUM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 reveal stagger-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-[#0F0F11] border border-white/[0.06] w-fit max-w-full">
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? activeEvents.length
                  : activeEvents.filter((e) => e.category === cat || e.status === cat).length;
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { soundFx.playClick(); setFilter(cat); }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FF4A15] text-white border-[#FF4A15] font-bold shadow-[0_6px_18px_rgba(255,74,21,0.28)]'
                      : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${isActive ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/50'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[320px]">
              <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, venue, keyword…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs font-mono text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            {viewLayout === 'runway' && filteredEvents.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRunway('left')}
                  className="w-9 h-9 rounded-full bg-[#0F0F11] border border-white/15 text-white/70 hover:text-white hover:border-[#FF4A15] hover:bg-[#FF4A15]/10 grid place-items-center transition-all cursor-pointer shadow-md"
                  aria-label="Scroll runway left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRunway('right')}
                  className="w-9 h-9 rounded-full bg-[#0F0F11] border border-white/15 text-white/70 hover:text-white hover:border-[#FF4A15] hover:bg-[#FF4A15]/10 grid place-items-center transition-all cursor-pointer shadow-md"
                  aria-label="Scroll runway right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event Cards Display */}
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center rounded-[28px] bg-white/[0.02] border border-dashed border-white/[0.07] reveal">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] grid place-items-center mx-auto">
              <Calendar className="w-6 h-6 text-white/30" />
            </div>
            <div className="mt-4 font-[Syne] font-[700] tracking-tight text-white text-lg">No events found in this category</div>
            <div className="text-xs font-mono text-white/40 mt-1">Adjust filters or search — total catalog holds {activeEvents.length} events.</div>
          </div>
        ) : viewLayout === 'grid' ? (
          /* BENTO GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
            {filteredEvents.map((evt, i) => (
              <EventCard key={evt.id} evt={evt} index={i} onRegisterClick={onRegisterClick} onShare={(e) => handleShare(evt, e as any)} />
            ))}
          </div>
        ) : (
          /* RUNWAY SLIDING VIEW */
          <div className="reveal relative -mx-4 sm:mx-0">
            <div
              ref={scrollContainerRef}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeaveOrUp}
              onMouseUp={onMouseLeaveOrUp}
              onMouseMove={onMouseMove}
              className="flex gap-5 overflow-x-auto custom-scrollbar snap-x sm:snap-none px-4 sm:px-0 pb-4 select-none cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filteredEvents.map((evt, i) => (
                <div key={evt.id} className="snap-start shrink-0 w-[84vw] sm:w-[360px] lg:w-[380px]">
                  <EventCard evt={evt} index={i} onRegisterClick={onRegisterClick} onShare={(e) => handleShare(evt, e as any)} />
                </div>
              ))}
              <div className="shrink-0 w-4 sm:w-2" aria-hidden />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const EventCard: React.FC<{
  evt: EventItem;
  index: number;
  onRegisterClick?: (e: EventItem) => void;
  onShare?: (e: React.MouseEvent) => void;
}> = ({ evt, index, onRegisterClick, onShare }) => {
  const fileRef = `EV-${String(index + 1).padStart(2, '0')}`;
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=20260730T043000Z/20260730T103000Z&details=${encodeURIComponent(evt.description)}&location=${encodeURIComponent(evt.venue)}`;
  const pctRemaining = evt.seatsRemaining !== undefined && evt.totalSeats ? Math.max(0, Math.min(100, (1 - evt.seatsRemaining / evt.totalSeats) * 100)) : null;
  const isSoldOut = evt.seatsRemaining === 0;

  return (
    <div className="group relative rounded-[26px] overflow-hidden flex flex-col h-full bg-[#0F0F11] border border-white/[0.08] backdrop-blur-2xl hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-xl">
      {/* Cover Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#050507]">
        <OptimizedImage
          src={evt.image}
          alt={evt.title}
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur border border-white/20 text-white px-3 py-1 text-[10.5px] font-mono font-bold">
            <Sparkles className="w-3 h-3 text-[#FF4A15]" /> {evt.badge || evt.category.toUpperCase()}
          </span>
          {evt.participationType === 'team_only' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4A15] text-white px-2.5 py-1 text-[10px] font-mono font-bold shadow-md">
              <Users className="w-3 h-3" /> Team of {evt.requiredTeamSize || `${evt.minTeamSize || 2}—${evt.maxTeamSize || 5}`}
            </span>
          )}
          {evt.participationType === 'individual_only' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-white px-2.5 py-1 text-[10px] font-mono font-bold">
              <User className="w-3 h-3" /> Solo Only
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noreferrer"
            title="Add to Google Calendar"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white grid place-items-center hover:bg-white hover:text-black transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
          </a>
          {onShare && (
            <button
              onClick={onShare}
              title="Share event link"
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white grid place-items-center hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1 font-bold leading-none shadow-md">
            <Calendar className="w-3 h-3" /> {evt.date}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4A15] text-white px-3 py-1 font-bold leading-none shadow-md">
            <Clock className="w-3 h-3" /> {evt.time}
          </span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white/70">
            {fileRef}
          </span>
        </div>
      </div>

      {/* Body Spec */}
      <div className="p-5 flex flex-col gap-3.5 flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 text-white/50 truncate">
              <MapPin className="w-3 h-3 text-[#FF4A15] shrink-0" /> <span className="truncate">{evt.venue}</span>
            </span>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
              evt.status === 'Upcoming' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-white/50'
            }`}>
              {evt.status}
            </span>
          </div>

          <h3 className="font-[Syne] font-[700] leading-[1.25] tracking-[-0.02em] text-[17px] text-white group-hover:text-white transition-colors line-clamp-2 mt-2">
            {evt.title}
          </h3>

          <p className="text-[12.5px] leading-[1.6] text-white/55 line-clamp-2 mt-1.5">{evt.description}</p>
        </div>

        <div>
          {/* Inventory Progress */}
          {pctRemaining !== null && (
            <div className="pt-2">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-white/40 uppercase">Remaining Seats</span>
                <span className={`font-bold ${isSoldOut ? 'text-red-400' : evt.seatsRemaining! < 15 ? 'text-[#FF4A15]' : 'text-emerald-400'}`}>
                  {isSoldOut ? 'SOLD OUT' : `${evt.seatsRemaining} / ${evt.totalSeats} SEATS`}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isSoldOut ? 'bg-red-500' : 'bg-[#FF4A15]'}`}
                  style={{ width: `${Math.max(6, pctRemaining)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
            <div>
              <div className="text-[9.5px] font-mono uppercase tracking-[0.10em] text-white/30">Entry Fee</div>
              <div className="mt-0.5 font-[Syne] font-[800] text-[17px] leading-none text-white">
                {evt.price && evt.price > 0 ? `₹${evt.price.toLocaleString('en-IN')}` : 'Free Entry'}
              </div>
            </div>

            {onRegisterClick ? (
              <button
                onClick={() => { soundFx.playLaser(); onRegisterClick(evt); }}
                disabled={isSoldOut}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-mono font-bold text-xs tracking-wide transition-all duration-300 cursor-pointer ${
                  isSoldOut
                    ? 'bg-white/[0.05] text-white/25 border border-white/[0.06] cursor-not-allowed'
                    : 'bg-[#FF4A15] text-white border border-[#FF4A15] shadow-[0_6px_20px_rgba(255,74,21,0.35)] hover:bg-[#FF4A15]/90 hover:scale-[1.02]'
                }`}
              >
                {isSoldOut ? 'Closed' : 'Register Pass'} {!isSoldOut && <ArrowUpRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30">
                {evt.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
