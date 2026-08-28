import React, { useState, useEffect } from 'react';
import { X, Ticket, QrCode, Search, Calendar, MapPin, ArrowRight, User, Sparkles } from 'lucide-react';
import { passService, type EventPass } from '../services/passService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PassCard } from './PassCard';
import { soundFx } from '../utils/audio';

interface MyPassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleAuth: () => void;
  onExploreEvents?: () => void;
}

export const MyPassesModal: React.FC<MyPassesModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleAuth,
  onExploreEvents,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [passes, setPasses] = useState<EventPass[]>([]);
  const [selectedPass, setSelectedPass] = useState<EventPass | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'checked_in'>('all');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPass) setSelectedPass(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedPass, onClose]);

  const refreshPasses = async () => {
    if (user?.email) {
      const cleanEmail = user.email.trim().toLowerCase();
      const localList = passService.getUserPasses(cleanEmail);
      if (localList.length > 0) setPasses(localList);
      try {
        const remote = await api.getPasses(undefined, cleanEmail);
        if (remote && Array.isArray(remote)) {
          const map = new Map<string, EventPass>();
          localList.forEach((p) => map.set(p.passId, p));
          remote.forEach((p: any) =>
            map.set(p.passId, {
              ...p,
              qrData:
                p.qrData ||
                JSON.stringify({
                  passId: p.passId,
                  name: p.userName,
                  email: p.userEmail,
                  event: p.eventTitle,
                  hash: p.securityHash,
                  date: p.eventDate,
                  venue: p.eventVenue,
                }),
            })
          );
          setPasses(Array.from(map.values()));
        }
      } catch {}
    } else {
      setPasses([]);
    }
  };

  useEffect(() => {
    if (isOpen) refreshPasses();
    const handler = () => refreshPasses();
    window.addEventListener('ece_passes_updated', handler);
    return () => window.removeEventListener('ece_passes_updated', handler);
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  const filteredPasses = passes.filter((p) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'upcoming'
        ? p.status === 'CONFIRMED'
        : p.status === 'CHECKED_IN';
    const matchesSearch =
      p.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.rollNumber && p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[rgba(10,14,20,0.97)] border border-white/[0.12] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-glass-xl backdrop-blur-3xl"
      >
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent" />
        
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/12 grid place-items-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {selectedPass ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedPass(null)}
              className="text-xs font-mono text-[#FF4A15] hover:underline flex items-center gap-1"
            >
              â† Back to all passes
            </button>
            <PassCard pass={selectedPass} onClose={() => setSelectedPass(null)} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3 pr-10">
              <div className="flex gap-3 min-w-0 items-center">
                <span className="w-11 h-11 rounded-2xl bg-[#FF4A15] text-black grid place-items-center shrink-0 shadow-[0_0_16px_rgba(255,74,21,0.35)]">
                  <Ticket className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-[Syne] font-[800] text-xl sm:text-2xl leading-tight text-white">
                    My Event Passes
                  </h3>
                  <p className="text-xs font-mono text-white/50 truncate">
                    {isAuthenticated ? `${user?.name} Â· ${user?.email}` : 'Sign in with Google to view your passes'}
                  </p>
                </div>
              </div>
              {!isAuthenticated && (
                <button
                  onClick={() => { soundFx.playClick(); onOpenGoogleAuth(); }}
                  className="shrink-0 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all"
                >
                  Sign in
                </button>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search event or Pass IDâ€¦"
                  className="w-full glass-input rounded-full pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-white/35 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6 flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-2xl">
                {[
                  { id: 'all', label: `All (${passes.length})` },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'checked_in', label: 'Checked In' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                      activeFilter === f.id
                        ? 'bg-[#FF4A15] text-black font-bold shadow-sm'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pass List */}
            {filteredPasses.length ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredPasses.map((pass) => (
                  <div
                    key={pass.passId}
                    className="rounded-2xl bg-[rgba(12,16,22,0.75)] border border-white/[0.08] p-4 space-y-3 hover:bg-[rgba(18,24,34,0.9)] hover:border-white/15 transition-all duration-300 backdrop-blur-xl shadow-glass-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/12">
                            {pass.passId}
                          </span>
                          <span
                            className={`text-[10.5px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
                              pass.status === 'CHECKED_IN'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                : 'bg-[#FF4A15]/15 text-[#FF4A15] border-[#FF4A15]/25'
                            }`}
                          >
                            {pass.status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white mt-1.5 leading-snug text-sm sm:text-base">{pass.eventTitle}</h4>
                      </div>
                      <span className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center shrink-0 shadow-md">
                        <QrCode className="w-5 h-5" />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-white/50 pt-2 border-t border-white/10">
                      <span className="inline-flex gap-1.5 items-center truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#FF4A15] shrink-0" /> {pass.eventDate}
                      </span>
                      <span className="inline-flex gap-1.5 items-center truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#FF4A15] shrink-0" /> {pass.eventVenue}
                      </span>
                      {pass.rollNumber && (
                        <span className="inline-flex gap-1.5 items-center truncate">
                          <User className="w-3.5 h-3.5 text-[#FF4A15] shrink-0" /> {pass.rollNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10.5px] font-mono text-white/35 truncate">{pass.paymentId}</span>
                      <button
                        onClick={() => { soundFx.playClick(); setSelectedPass(pass); }}
                        className="shrink-0 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF4A15] to-[#FF6B3A] text-black text-xs font-bold inline-flex items-center gap-1 hover:shadow-[0_0_16px_rgba(255,74,21,0.4)] transition-all duration-300"
                      >
                        View Pass <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 rounded-3xl bg-white/[0.02] border border-dashed border-white/[0.08]">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] mx-auto grid place-items-center text-white/40">
                  <Ticket className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">No Passes Found</h4>
                <p className="text-xs font-mono text-white/45 max-w-sm mx-auto">
                  {isAuthenticated
                    ? `No registered passes for ${user?.email}. Register for an upcoming event to receive your pass.`
                    : 'Sign in with Google to retrieve your registered event passes.'}
                </p>
                {onExploreEvents && (
                  <button
                    onClick={() => { onClose(); onExploreEvents(); }}
                    className="px-6 py-2.5 rounded-full bg-[#FF4A15] text-black font-bold text-xs hover:bg-[#FF6B3A] transition-all"
                  >
                    Explore Events
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
