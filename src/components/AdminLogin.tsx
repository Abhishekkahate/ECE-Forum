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
    <div className="space-y-6 max-w-md mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime via-blue-500 to-amber p-0.5 shadow-lime mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-midnight rounded-[14px] flex items-center justify-center">
            <Shield className="w-8 h-8 text-lime animate-pulse" />
          </div>
        </div>

        <h3 className="font-space font-extrabold text-2xl text-white">
          Admin Portal Authentication
        </h3>
        <p className="text-xs font-mono text-slate-400">
          Restricted Access · Authorized Council Organizers Only
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-slate-300 flex items-center space-x-1">
            <Mail className="w-3.5 h-3.5 text-lime" />
            <span>Admin Email Address *</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ece-forum.org"
            className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-slate-300 flex items-center space-x-1">
            <KeyRound className="w-3.5 h-3.5 text-amber" />
            <span>Password *</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-lime"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lime via-blue-500 to-lime font-space font-bold text-xs text-midnight shadow-lime hover:opacity-90 transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-50"
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

        <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
          🔒 Secured with Supabase Cloud &amp; Role-Based Access Control
        </div>
      </form>
    </div>
  );
};
