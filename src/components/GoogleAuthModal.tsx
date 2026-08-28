import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
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
      setErrorMsg(err?.message || 'Failed to authenticate with Google. Please try again.');
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
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/12 grid place-items-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/12 text-[11px] font-mono font-bold tracking-widest text-[#FF4A15]">
            <Sparkles className="w-3 h-3" /> PIET ECE FORUM SSO
          </div>
          <h3 className="font-[Syne] font-[800] text-2xl sm:text-3xl tracking-[-0.02em] text-white">
            Sign in with Google
          </h3>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed">
            Use your college or personal Google identity to register for events and instantly retrieve your passes.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 px-5 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.1C3.26 21.48 7.34 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.1z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isLoading ? 'Authenticatingâ€¦' : 'Continue with Google'}</span>
        </button>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] font-mono text-white/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF4A15]" />
          <span>{isSupabaseActive ? 'Supabase Auth Verified' : 'Encrypted OAuth Session'}</span>
        </div>
      </div>
    </div>
  );
};
