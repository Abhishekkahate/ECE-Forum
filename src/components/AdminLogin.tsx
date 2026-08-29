import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { api } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: (user: { email: string; role: string }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setError('');

    if (!email || !password) {
      setError('Please provide your admin email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.loginAdmin(email, password);
      if (res.success && res.user) {
        soundFx.playLaser();
        onLoginSuccess({ email: res.user.email, role: res.user.role || 'Event Organizer' });
      } else {
        setError(res.error || 'Access Denied: Invalid admin credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#FF4A15]/10 border border-[#FF4A15]/30 text-[#FF4A15] shadow-[0_0_30px_rgba(255,74,21,0.2)] mx-auto flex items-center justify-center">
          <Shield className="w-7 h-7 text-[#FF4A15]" />
        </div>

        <h3 className="font-[Syne] font-[800] text-xl text-[#F5F3EF]">
          Admin Portal Authentication
        </h3>
        <p className="text-xs font-mono text-white/40">
          Restricted Access &bull; Authorized Council Organizers Only
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 font-mono text-xs">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-white/70 flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-[#FF4A15]" />
            <span>Admin Email Address *</span>
          </label>
          <input
            type="email"
            required
            autoComplete="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ece.com"
            className="w-full bg-[#08080A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#FF4A15]"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-white/70 flex items-center space-x-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>Password *</span>
          </label>
          <input
            type="password"
            required
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#08080A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#FF4A15]"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-[#FF4A15] text-white font-[Syne] font-[800] text-xs shadow-[0_0_20px_rgba(255,74,21,0.35)] hover:bg-white hover:text-black transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Authenticate Admin Session</span>
            </>
          )}
        </button>

        <div className="pt-2 text-center text-[10px] text-white/35 font-mono">
          🔒 Secured with Supabase Cloud &amp; Role-Based Access Control
        </div>
      </form>
    </div>
  );
};
