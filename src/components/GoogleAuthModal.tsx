import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, isSupabaseActive } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      soundFx.playLaser();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.warn('Google OAuth error:', err);
      setErrorMsg(err?.message || 'Unable to connect to Google Sign-In. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        className="relative bg-[rgba(10,14,20,0.97)] border border-white/[0.12] rounded-[32px] p-7 sm:p-9 max-w-md w-full shadow-glass-xl backdrop-blur-3xl"
      >
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent" />
        
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/12 grid place-items-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/12 text-[11px] font-mono font-bold tracking-widest text-[#FF4A15]">
            <Sparkles className="w-3 h-3" /> PIET ECE FORUM SSO
          </div>
          <h3 className="font-[Syne] font-[800] text-2xl sm:text-3xl tracking-[-0.02em] text-white">
            Sign in with Google
          </h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            Use your college or personal Google account to instantly access your registrations, event passes, and verified certificates.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-[#F5F3EF] text-neutral-900 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_10px_30px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_14px_36px_-6px_rgba(255,255,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Connecting to Google…</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-neutral-900 tracking-tight font-bold">Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] font-mono text-center text-white/40">
            One-click authentication &bull; No passwords or manual forms required
          </p>
        </div>

        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] font-mono text-white/45">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00E5CC]" />
          <span>{isSupabaseActive ? 'Supabase OAuth 2.0 Verified' : 'Secure Encrypted Session'}</span>
        </div>
      </div>
    </div>
  );
};
