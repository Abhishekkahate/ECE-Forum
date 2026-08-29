import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, ShieldCheck, Timer, Share2, Check, Sparkles, ArrowUpRight, Search, Hash, Layers } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shareToast, setShareToast] = useState<string | null>(null);
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

  const targetDate = parseTargetDate(heroConfig.flagshipTargetDate);
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

  const categories = ['All', 'Upcoming', 'Workshop', 'Competition', 'Seminar', 'Past'] as const;

  return (
    <section id="events" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden">
      <div className="absolute inset-0 editorial-grid opacity-[0.04] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[640px] h-[480px] -top-28 -right-36 opacity-[0.22]" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[rgba(16,16,18,0.96)] border border-white/[0.10] text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-glass-xl backdrop-blur-3xl">
          <span className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center shrink-0"><Check className="w-3.5 h-3.5" /></span>
          {shareToast}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — lighter, more whitespace */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-10 mb-10">
          <div className="reveal max-w-[640px]">
            <div className="section-eyebrow-hud">
              <Layers className="w-3.5 h-3.5" /> 03 — EVENTS & REGISTRATION
            </div>
            <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.045em] leading-[0.88] text-[34px] sm:text-[42px] lg:text-[46px] text-[#F5F3EF]">
              Calendar & <span className="font-[Instrument_Serif] italic font-[400] text-[#FF4A15]">live registration.</span>
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.07] px-3 py-1 text-white/55"><Hash className="w-3 h-3 text-white/30" /> {activeEvents.length} CATALOGUED</span>
            </div>
          </div>
          <p className="text-[13.5px] leading-[1.7] font-mono text-white/40 max-w-[360px] reveal stagger-2 border-l border-white/[0.07] pl-4">
            Ceremonies, workshops &amp; hackathons — each entry filed as a dossier with clear specs and secure enrollment.
          </p>
        </div>

        {/* Flagship — compact, cleaner header */}
        <div className="reveal stagger-1 mb-10 rounded-[24px] overflow-hidden bg-[rgba(16,16,18,0.72)] border border-white/[0.07] backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-6 sm:p-7 lg:p-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A15] text-white px-3 py-1 font-bold tracking-[0.06em]"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {heroConfig.flagshipBadge || 'FLAGSHIP DOSSIER'}</span>
                <span className="text-white/30 tracking-[0.08em] hidden sm:inline">FILE REF — TARANG-2K26</span>
              </div>

              <div>
                <h3 className="font-[Syne] font-[800] tracking-[-0.035em] leading-[0.92] text-[26px] sm:text-[32px] text-[#F5F3EF]">
                  {heroConfig.flagshipTitle || 'SPACE & SINC Installation'}
                  <br />
                  <span className="font-[Instrument_Serif] italic font-[400] text-[#FF4A15]">
                    {heroConfig.flagshipSubTitle || '& TARANG 2K26'}
                  </span>
                </h3>
                <p className="mt-2.5 text-[13px] leading-[1.6] text-white/50 max-w-[540px]">
                  {heroConfig.flagshipDescription || 'Grand induction of the 2026—27 council followed by freshers welcome gala and technical showcase.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { k: 'DATE', v: (heroConfig.flagshipTargetDate || '2026-07-30').slice(0,10), sub: '09:45 AM IST' },
                  { k: 'VENUE', v: heroConfig.flagshipTargetVenue || 'AUDITORIUM', sub: 'PIET CAMPUS' },
                  { k: 'EDITION', v: '14TH', sub: 'ESTD 2012' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-3">
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/30">{s.k}</div>
                    <div className="mt-1 font-mono font-bold text-[12.5px] text-white leading-none truncate">{s.v}</div>
                    <div className="text-[10.5px] font-mono text-white/35 mt-1 leading-none truncate">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {onRegisterClick && activeEvents.length > 0 && (
                  <button
                    onClick={() => { soundFx.playLaser(); onRegisterClick(activeEvents[0]); }}
                    className="btn-signal !px-6 !py-2.5 !text-[12px]"
                  >
                    <ShieldCheck className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{heroConfig.flagshipButtonText || 'Register for Flagship'}</span>
                    <ChevronRight className="w-4 h-4 opacity-80 relative z-10" />
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SECURE ENROLLMENT</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative bg-[#0A0A0C] lg:border-l border-white/[0.06] p-6 sm:p-7 lg:p-8 flex flex-col justify-center gap-4">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4A15]/[0.03] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.12em] text-white/35"><Timer className="w-3.5 h-3.5 text-white/30" /> T-MINUS</span>
                <span className="text-[10px] font-mono tracking-[0.10em] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-white/40">LIVE</span>
              </div>

              <div className="relative grid grid-cols-4 gap-2">
                {[
                  { k: 'DAYS', v: pad(timeLeft.days) },
                  { k: 'HOURS', v: pad(timeLeft.hours) },
                  { k: 'MINS', v: pad(timeLeft.minutes) },
                  { k: 'SECS', v: pad(timeLeft.seconds), accent: true },
                ].map((b) => (
                  <div key={b.k} className="text-center">
                    <div className="text-[10px] font-mono tracking-[0.12em] text-white/30">{b.k}</div>
                    <div
                      className={`mt-1.5 h-12 sm:h-[52px] rounded-xl grid place-items-center font-mono font-[800] text-[20px] sm:text-[22px] tracking-[-0.03em] border ${
                        b.accent
                          ? 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_0_18px_rgba(255,74,21,0.35)]'
                          : 'bg-white/[0.04] border-white/[0.07] text-white'
                      }`}
                    >
                      {b.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative rounded-xl bg-white/[0.04] border border-white/[0.06] px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono text-white/55 truncate">
                  <Calendar className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="truncate">{(heroConfig.flagshipTargetDate || '2026-07-30T09:45:00').replace('T', ' · ')}</span>
                </span>
                <span className="shrink-0 text-[10.5px] font-mono px-2.5 py-1 rounded-full bg-white text-[#08080A] font-bold">{heroConfig.flagshipTargetVenue || 'AUDITORIUM'}</span>
              </div>
              <div className="relative text-[11px] font-mono text-white/25 border-t border-white/[0.05] pt-3 leading-relaxed">
                Clock synced to IST · updates stream via portal.
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search — editorial controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-7 reveal stagger-2">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-full bg-[#0F0F11] border border-white/[0.06] w-fit max-w-full">
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FF4A15] text-white border-[#FF4A15] font-bold shadow-[0_6px_18px_rgba(255,74,21,0.28)]'
                      : 'bg-transparent border-transparent text-white/45 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${isActive ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/50'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-[320px] shrink-0">
            <Search className="w-4 h-4 text-white/25 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dossiers, venue, brief…"
              className="w-full pl-10 pr-4 py-3 rounded-full glass-input text-xs font-mono text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* RUNWAY — editorial, larger gap, soft edge fades */}
        <div className="reveal">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.10em] text-white/30">
              <span className="hidden sm:inline-flex items-center gap-2"><span className="w-5 h-px bg-white/10" /> RUNWAY</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.07] px-3 py-1 text-white/45"><Hash className="w-3 h-3 text-white/30" /> {filteredEvents.length} DOSSIERS</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-[0.12em] text-white/20">
              <span>DRAG TO SCAN</span> <ArrowUpRight className="w-3 h-3 rotate-45" />
            </div>
          </div>

          {filteredEvents.length ? (
            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-4 scroll-px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                {filteredEvents.map((evt, i) => (
                  <div key={evt.id} className="snap-start shrink-0 w-[86vw] sm:w-[360px] lg:w-[380px] reveal" style={{ transitionDelay: `${(i % 4) * 60}ms` } as React.CSSProperties}>
                    <EventCard evt={evt} index={i} onRegisterClick={onRegisterClick} onShare={(e) => handleShare(evt, e as any)} />
                  </div>
                ))}
                <div className="shrink-0 w-4 sm:w-2" aria-hidden />
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#08080A] to-transparent hidden sm:block" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#08080A] to-transparent hidden sm:block" />
            </div>
          ) : (
            <div className="py-16 text-center rounded-[24px] bg-white/[0.02] border border-dashed border-white/[0.07]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] grid place-items-center mx-auto"><Calendar className="w-6 h-6 text-white/25" /></div>
              <div className="mt-4 font-[Syne] font-[700] tracking-tight text-white">No dossiers in this runway</div>
              <div className="text-xs font-mono text-white/35 mt-1">Adjust filters — catalog contains {activeEvents.length} filed entries.</div>
            </div>
          )}
        </div>
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
    <div className="group relative rounded-[24px] overflow-hidden flex flex-col h-full bg-[rgba(16,16,18,0.72)] border border-white/[0.07] backdrop-blur-xl hover:border-white/10 hover:bg-[rgba(20,20,22,0.8)] transition-colors">
      {/* cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0A0C]">
        <OptimizedImage
          src={evt.image}
          alt={evt.title}
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#08080A] px-3 py-1 text-[11px] font-mono font-bold tracking-[0.04em]">
            <Sparkles className="w-3 h-3 text-[#FF4A15]" /> {evt.badge || evt.category.toUpperCase()}
          </span>
        </div>

        <div className="absolute top-3 right-3 hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noreferrer"
            title="Add to Google Calendar"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-xl border border-white/15 text-white grid place-items-center hover:bg-white hover:text-[#08080A] transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
          </a>
          {onShare && (
            <button
              onClick={onShare}
              title="Share dossier link"
              className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-xl border border-white/15 text-white grid place-items-center hover:bg-white hover:text-[#08080A] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#08080A] px-3 py-1.5 font-bold leading-none">
            <Calendar className="w-3 h-3" /> {evt.date}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4A15] text-white px-3 py-1.5 font-bold leading-none">
            <Clock className="w-3 h-3" /> {evt.time}
          </span>
          <span className="ml-auto hidden sm:inline-flex text-[10px] font-mono px-2 py-1 rounded-full bg-black/55 backdrop-blur border border-white/10 text-white/60">{fileRef}</span>
        </div>
      </div>

      {/* body — airy, 2-pill spec only */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 text-white/45 truncate">
            <MapPin className="w-3 h-3 text-white/30 shrink-0" /> <span className="truncate">{evt.venue}</span>
          </span>
          {evt.participationType === 'individual_only' ? (
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.07] text-white/70 text-[10px] font-bold tracking-wide">SOLO</span>
          ) : evt.participationType === 'team_only' ? (
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/20 text-[#FF4A15] text-[10px] font-bold tracking-wide">TEAM 2—5</span>
          ) : (
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/45 text-[10px] tracking-wide">SOLO / TEAM</span>
          )}
        </div>

        <h3 className="font-[Syne] font-[700] leading-[1.2] tracking-[-0.02em] text-[16px] text-white group-hover:text-white transition-colors line-clamp-2">
          {evt.title}
        </h3>

        <p className="text-[12.5px] leading-[1.6] text-white/45 line-clamp-2">{evt.description}</p>

        {/* 2-col spec — reduced from 3 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-mono tracking-[0.10em] text-white/30 leading-none">STATUS</div>
            <div className={`text-[12px] font-mono font-bold mt-1.5 leading-none ${evt.status === 'Upcoming' ? 'text-emerald-400' : evt.status === 'Ongoing' ? 'text-[#FF4A15]' : 'text-white/40'}`}>{evt.status.toUpperCase()}</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2.5">
            <div className="text-[10px] font-mono tracking-[0.10em] text-white/30 leading-none">ADMISSION</div>
            <div className="text-[12px] font-mono font-bold text-white mt-1.5 leading-none">{evt.price && evt.price > 0 ? `₹${evt.price}` : 'FREE'}</div>
          </div>
        </div>

        {pctRemaining !== null && (
          <div className="pt-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="tracking-[0.06em] text-white/30">INVENTORY</span>
              <span className={`font-bold text-[11px] ${isSoldOut ? 'text-red-400' : evt.seatsRemaining! < 10 ? 'text-[#FF4A15]' : 'text-white/60'}`}>
                {isSoldOut ? 'SOLD OUT' : `${evt.seatsRemaining} left`}
              </span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isSoldOut ? 'bg-red-500' : 'bg-[#FF4A15]'}`}
                style={{ width: `${Math.max(6, pctRemaining)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-mono tracking-[0.10em] text-white/25 leading-none">FROM</div>
            <div className="mt-1 font-[Syne] font-[800] tracking-[-0.02em] text-[15px] leading-none text-white">
              {evt.price && evt.price > 0 ? `₹${evt.price.toLocaleString('en-IN')}` : 'Free Entry'}
            </div>
            <div className="text-[11px] font-mono text-white/30 leading-none mt-1 truncate">{evt.speaker ? evt.speaker : 'PIET ECE Forum'}</div>
          </div>

          {onRegisterClick ? (
            <button
              onClick={() => { soundFx.playLaser(); onRegisterClick(evt); }}
              disabled={isSoldOut}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-mono font-bold text-xs tracking-wide transition-all duration-300 ${
                isSoldOut
                  ? 'bg-white/[0.05] text-white/25 border border-white/[0.06] cursor-not-allowed'
                  : 'bg-[#FF4A15] text-white border border-[#FF4A15] shadow-[0_8px_18px_rgba(255,74,21,0.28)] hover:shadow-[0_10px_24px_rgba(255,74,21,0.38)] hover:translate-y-[-1px]'
              }`}
            >
              {isSoldOut ? 'Closed' : 'Register'} {!isSoldOut && <ArrowUpRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30">{evt.status}</span>
          )}
        </div>
      </div>
    </div>
  );
};
