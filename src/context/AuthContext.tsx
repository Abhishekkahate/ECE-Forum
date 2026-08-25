import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  rollNumber?: string;
  department?: string;
  year?: string;
  phone?: string;
  role?: 'student' | 'organizer' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSupabaseActive: boolean;
  loginWithGoogle: (customData?: Partial<UserProfile>) => Promise<UserProfile | void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ece_forum_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fix vercel.app redirect — if Supabase Site URL is still vercel.app, OAuth will land there even when started from localhost/other. Detect and bounce back.
  useEffect(() => {
    try {
      const returnHref = localStorage.getItem('ece_auth_return_url');
      const returnOrigin = localStorage.getItem('ece_auth_origin');
      const isVercelHost = window.location.hostname.includes('ece-at-pce.vercel.app');
      const hasAuthCode = window.location.search.includes('code=');
      if (isVercelHost && returnOrigin && returnOrigin !== window.location.origin) {
        // If we have a code, let Supabase exchange it first, then bounce back to original origin
        if (hasAuthCode) {
          // Wait for session to be set, then redirect
          setTimeout(() => {
            try { localStorage.removeItem('ece_auth_return_url'); localStorage.removeItem('ece_auth_origin'); } catch {}
            window.location.href = returnOrigin + '/';
          }, 1800);
        } else if (returnHref && returnHref !== window.location.href) {
          window.location.href = returnHref;
        }
      } else if (!isVercelHost && hasAuthCode) {
        // Clean up after successful PKCE on correct origin
        try { localStorage.removeItem('ece_auth_return_url'); localStorage.removeItem('ece_auth_origin'); } catch {}
      }
    } catch {}
  }, []);

  // Sync Supabase Auth state change listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    // Check existing active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const profile: UserProfile = {
          uid: session.user.id,
          name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Student',
          email: session.user.email || '',
          photoURL: metadata.avatar_url || metadata.picture,
          department: metadata.department || 'Electronics & Communication Engineering',
          year: metadata.year || '3rd Year',
          phone: metadata.phone || '',
          role: 'student',
        };
        setUser(profile);
        // If we landed on vercel.app with a stored return origin, bounce back now that session is ready
        try {
          const returnOrigin = localStorage.getItem('ece_auth_origin');
          if (returnOrigin && window.location.hostname.includes('ece-at-pce.vercel.app') && returnOrigin !== window.location.origin) {
            setTimeout(()=>{ window.location.href = returnOrigin + '/'; }, 800);
          }
        } catch {}
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const profile: UserProfile = {
          uid: session.user.id,
          name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Student',
          email: session.user.email || '',
          photoURL: metadata.avatar_url || metadata.picture,
          department: metadata.department || 'Electronics & Communication Engineering',
          year: metadata.year || '3rd Year',
          phone: metadata.phone || '',
          role: 'student',
        };
        setUser(profile);
        // Bounce back to original origin if we were redirected to vercel.app
        try {
          const returnOrigin = localStorage.getItem('ece_auth_origin');
          if (returnOrigin && window.location.hostname.includes('ece-at-pce.vercel.app') && returnOrigin !== window.location.origin) {
            setTimeout(()=>{ localStorage.removeItem('ece_auth_return_url'); localStorage.removeItem('ece_auth_origin'); window.location.href = returnOrigin + '/'; }, 600);
          } else {
            localStorage.removeItem('ece_auth_return_url');
            localStorage.removeItem('ece_auth_origin');
          }
        } catch {}
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        try { localStorage.removeItem('ece_auth_return_url'); localStorage.removeItem('ece_auth_origin'); } catch {}
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const loginWithGoogle = async (customData?: Partial<UserProfile>): Promise<UserProfile | void> => {
    // If Supabase OAuth is configured and user initiated real Google SSO:
    if (isSupabaseConfigured && supabase && !customData?.email) {
      // Store return URL to handle vercel.app → localhost redirect fix
      try { localStorage.setItem('ece_auth_return_url', window.location.href); localStorage.setItem('ece_auth_origin', window.location.origin); } catch {}
      // Use current origin + pathname as redirect — must be whitelisted in Supabase Dashboard > Auth > URL Configuration
      // If not whitelisted, Supabase will fallback to Site URL (ece-at-pce.vercel.app) — we handle that via post-auth redirect below
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }
      // data.url contains the Google OAuth URL — let Supabase handle redirect
      return;
    }

    // Quick demo profile handler (only when explicit demo data is chosen)
    if (customData?.email) {
      const demoUser: UserProfile = {
        uid: 'demo-' + (customData.email.split('@')[0] || Date.now()),
        name: customData.name || 'Student Attendee',
        email: customData.email,
        photoURL:
          customData.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        department: customData.department || 'Electronics & Communication Engineering',
        year: customData.year || '3rd Year',
        phone: customData.phone || '',
        role: customData.role || 'student',
      };
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSupabaseActive: isSupabaseConfigured,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
