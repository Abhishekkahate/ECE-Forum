import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Search,
  Calendar,
  Sparkles,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Tag,
  Trophy,
} from 'lucide-react';
import { certificateService } from '../services/certificateService';
import { forumApi, type ApiCertificate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CertificateCard } from './CertificateCard';
import { soundFx } from '../utils/audio';

interface MyCertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleAuth: () => void;
  onExploreEvents?: () => void;
}

export const MyCertificatesModal: React.FC<MyCertificatesModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleAuth,
  onExploreEvents,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<ApiCertificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'participation' | 'merit_winner'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCert) setSelectedCert(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedCert, onClose]);

  const refreshCertificates = async () => {
    if (user?.email) {
      const cleanEmail = user.email.trim().toLowerCase();
      setIsLoading(true);

      // 1. Initial cached list
      const localList = certificateService.getUserCertificates(cleanEmail);
      if (localList.length > 0) setCertificates(localList);

      // 2. Fresh remote fetch
      try {
        const remote = await forumApi.getCertificates(undefined, cleanEmail);
        if (remote && Array.isArray(remote)) {
          const map = new Map<string, ApiCertificate>();
          localList.forEach((c) => map.set(c.certId, c));
          remote.forEach((c) => map.set(c.certId, c));
          setCertificates(Array.from(map.values()));
        }
      } catch {}
      setIsLoading(false);
    } else {
      setCertificates([]);
    }
  };

  useEffect(() => {
    if (isOpen) refreshCertificates();
    const handler = () => refreshCertificates();
    window.addEventListener('ece_certificates_updated', handler);
    return () => window.removeEventListener('ece_certificates_updated', handler);
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  const participationCount = certificates.filter((c) => c.certType === 'PARTICIPATION').length;
  const meritWinnerCount = certificates.filter((c) => c.certType !== 'PARTICIPATION').length;

  const filteredCerts = certificates.filter((c) => {
    const isMeritWinner = c.certType !== 'PARTICIPATION';
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'participation'
        ? c.certType === 'PARTICIPATION'
        : isMeritWinner;

    const matchesSearch =
      c.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.rankText && c.rankText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-3xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[rgba(10,14,20,0.97)] border border-white/[0.12] rounded-[32px] p-5 sm:p-8 max-w-4xl w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-glass-xl backdrop-blur-3xl"
      >
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/12 grid place-items-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {selectedCert ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                soundFx.playClick();
                setSelectedCert(null);
              }}
              className="text-xs font-mono text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              ← Back to all certificates
            </button>
            <CertificateCard certificate={selectedCert} onClose={() => setSelectedCert(null)} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pr-10">
              <div className="flex gap-3 min-w-0 items-center">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FF4A15] text-black grid place-items-center shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.35)]">
                  <Award className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-[Syne] font-[800] text-xl sm:text-2xl leading-tight text-white flex items-center gap-2">
                    <span>My E-Certificates</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                      {certificates.length} ISSUED
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-white/50 truncate">
                    {isAuthenticated
                      ? `${user?.name} · ${user?.email}`
                      : 'Sign in with Google to view and download your issued certificates'}
                  </p>
                </div>
              </div>
            </div>

            {/* Authentication Notice for Guest Users */}
            {!isAuthenticated ? (
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 mx-auto grid place-items-center text-[#FFD700]">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">Sign In to Access Your Credentials</h4>
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  Certificates issued by ECE Forum PIET are securely linked to your registered student email
                  address.
                </p>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onOpenGoogleAuth();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#FFD700] hover:bg-[#F5C700] text-black font-bold text-xs tracking-wide shadow-lg transition-all cursor-pointer"
                >
                  Sign In With Google
                </button>
              </div>
            ) : (
              <>
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activeFilter === 'all'
                          ? 'bg-[#FFD700] text-black font-bold shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      All ({certificates.length})
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveFilter('merit_winner');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activeFilter === 'merit_winner'
                          ? 'bg-[#FFD700] text-black font-bold shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Rank &amp; Merit ({meritWinnerCount})
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveFilter('participation');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activeFilter === 'participation'
                          ? 'bg-[#FFD700] text-black font-bold shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Participation ({participationCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search event, rank, ID..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FFD700]/50 font-sans"
                    />
                  </div>
                </div>

                {/* Certificates Grid List */}
                {filteredCerts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredCerts.map((cert) => {
                      const isMerit = cert.certType !== 'PARTICIPATION';
                      return (
                        <div
                          key={cert.certId}
                          onClick={() => {
                            soundFx.playClick();
                            setSelectedCert(cert);
                          }}
                          className="group relative p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-[#FFD700]/50 transition-all cursor-pointer shadow-md flex flex-col justify-between gap-3 overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold tracking-wider uppercase border ${
                                    isMerit
                                      ? 'bg-amber-500/15 border-yellow-400/40 text-yellow-300'
                                      : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
                                  }`}
                                >
                                  {cert.rankText || (isMerit ? 'WINNER / MERIT' : 'PARTICIPATION')}
                                </span>
                                <span className="text-[10px] font-mono text-white/40">
                                  {cert.issuedAt}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-white group-hover:text-[#FFD700] transition-colors line-clamp-1">
                                {cert.eventTitle}
                              </h4>
                              <p className="text-xs font-serif text-white/70 line-clamp-1 italic">
                                {cert.title}
                              </p>
                            </div>

                            <span className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#FFD700] text-white/60 group-hover:text-black grid place-items-center shrink-0 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/50">
                            <span className="truncate">ID: {cert.certId}</span>
                            <span className="text-emerald-400 flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto grid place-items-center text-white/40">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">No Certificates Found</h4>
                      <p className="text-xs text-white/50 max-w-sm mx-auto font-sans">
                        {searchQuery
                          ? `No certificates matched "${searchQuery}".`
                          : "You don't have any certificates issued under this email address yet."}
                      </p>
                    </div>
                    {onExploreEvents && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onExploreEvents();
                        }}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Participate in Live Events</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
