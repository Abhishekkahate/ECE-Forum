import React, { useState, useEffect } from 'react';
import { X, Ticket, QrCode, Search, Calendar, MapPin, ArrowRight, User } from 'lucide-react';
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

  const refreshPasses = async () => {
    if (user?.email) {
      const cleanEmail = user.email.trim().toLowerCase();
      // 1. Get from local passService cache
      const localList = passService.getUserPasses(cleanEmail);
      if (localList.length > 0) {
        setPasses(localList);
      }

      // 2. Fetch from Supabase Cloud DB via API
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
          return;
        }
      } catch (err) {
        console.warn('Failed to load remote passes in MyPassesModal:', err);
      }
    } else {
      setPasses([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshPasses();
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-midnight-deep/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        data-lenis-prevent
        className="bg-midnight-lighter border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain shadow-[0_0_80px_rgba(0,0,0,0.9)] relative my-auto"
      >
        {/* Top cyan accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close passes dialog"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-midnight border border-white/10 text-slate-400 hover:text-white hover:border-white/25 flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {selectedPass ? (
          /* Detailed Pass View & Download Mode */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedPass(null)}
              className="inline-flex items-center gap-1 px-2 py-2.5 -ml-2 rounded-lg text-xs font-mono text-lime hover:underline hover:bg-white/5 cursor-pointer min-h-[44px]"
            >
              ← Back to All Passes
            </button>
            <PassCard pass={selectedPass} onClose={() => setSelectedPass(null)} />
          </div>
        ) : (
          /* Passes List View */
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-space font-extrabold text-base sm:text-xl text-white truncate">
                      My Registered Event Passes
                    </h3>
                    <p className="text-xs font-mono text-slate-400 truncate">
                      {isAuthenticated
                        ? `Logged in as ${user?.name} (${user?.email})`
                        : 'Explore and download your forum event passes'}
                    </p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onOpenGoogleAuth();
                    }}
                    className="shrink-0 px-3 py-2.5 rounded-xl bg-white text-slate-900 font-mono text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Google Login</span>
                  </button>
                )}
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 pt-2">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event or Pass ID..."
                    className="w-full bg-midnight border border-white/10 rounded-xl pl-9 pr-3 py-3 sm:py-2 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime"
                  />
                </div>

                <div className="sm:col-span-6 flex gap-1.5 bg-midnight p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`flex-1 py-2.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-lime/20 text-lime font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({passes.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('upcoming')}
                    className={`flex-1 py-2.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      activeFilter === 'upcoming'
                        ? 'bg-lime/20 text-lime font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveFilter('checked_in')}
                    className={`flex-1 py-2.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      activeFilter === 'checked_in'
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Checked In
                  </button>
                </div>
              </div>
            </div>

            {/* Passes List Container */}
            {filteredPasses.length > 0 ? (
              <div data-lenis-prevent className="space-y-3 max-h-[min(420px,52dvh)] overflow-y-auto overscroll-contain pr-1">
                {filteredPasses.map((pass) => (
                  <div
                    key={pass.passId}
                    className="p-4 rounded-2xl bg-midnight border border-white/10 hover:border-lime/40 transition-all space-y-3 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime/10 border border-lime/30 text-lime font-bold truncate max-w-[150px]" title={pass.passId}>
                            {pass.passId}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                              pass.status === 'CHECKED_IN'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {pass.status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}
                          </span>
                        </div>
                        <h4 className="font-space font-bold text-white text-sm group-hover:text-lime transition-colors">
                          {pass.eventTitle}
                        </h4>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6 text-lime" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-lime" />
                        <span className="truncate">{pass.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber" />
                        <span className="truncate">{pass.eventVenue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-pink-400" />
                        <span className="truncate">Roll: {pass.rollNumber}</span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-500 truncate min-w-0" title={pass.paymentId}>
                        TXN: {pass.paymentId}
                      </span>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedPass(pass);
                        }}
                        className="shrink-0 px-3 py-2.5 rounded-xl bg-lime/15 hover:bg-lime/25 border border-lime/40 text-lime text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View &amp; Download Pass</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-midnight border border-white/10 mx-auto flex items-center justify-center text-slate-500">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-space font-bold text-white text-base">No Event Passes Found</h4>
                  <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                    {isAuthenticated
                      ? `No passes found for ${user?.email}. Register for an upcoming event below to generate your unique entry badge!`
                      : 'Sign in with your Google account to view your registered event passes.'}
                  </p>
                </div>
                {onExploreEvents && (
                  <button
                    onClick={() => {
                      onClose();
                      onExploreEvents();
                    }}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-lime to-blue-600 font-space font-bold text-xs text-midnight shadow-lime transition-all cursor-pointer"
                  >
                    Explore Upcoming Events
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
