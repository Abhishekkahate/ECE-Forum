import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await loginWithGoogle();
      soundFx.playLaser();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err?.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-deep/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        data-lenis-prevent
        className="bg-midnight-lighter border border-white/[0.12] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_80px_rgba(0,0,0,0.9)] relative my-8 overflow-hidden"
      >
        {/* Holographic Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime via-amber to-lime animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-midnight border border-white/10 text-slate-400 hover:text-white hover:border-white/25 flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-[10px] font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ECE Forum SSO Authentication</span>
          </div>

          <h3 className="font-space font-extrabold text-2xl text-white">
            Sign In with Google
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Connect your college Google identity for pass retrieval.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google SSO Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-4 rounded-2xl bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.52 1.24 6.59l4.04 3.1c.95-2.84 3.6-4.94 6.72-4.94z"
              />
            </svg>
            <span className="font-space font-bold">
              {isLoading ? 'Connecting to Google SSO...' : 'Continue with Google Account'}
            </span>
          </button>

          {/* Security Badge */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-lime" />
            <span>
              {isSupabaseActive
                ? 'Secured with Supabase Cloud Identity'
                : 'Encrypted SSO Session'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
