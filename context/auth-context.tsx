'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '@/lib/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, name?: string, discord?: string) => CustomerUser;
  loginWithOAuth: (provider: 'google' | 'discord') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'peti_customer_user_v3';

// Determine if an email has admin privileges based on configuration or metadata
export const checkIsAdminEmail = (email: string, roleMeta?: string): boolean => {
  if (roleMeta === 'admin') return true;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'francoberlochi@gmail.com,peti.artist@gmail.com,peti@gmail.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
  
  const normalized = email.toLowerCase().trim();
  return adminEmails.includes(normalized) || normalized.includes('peti.artist') || normalized.includes('francoberlochi');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading user from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Error saving user to localStorage', e);
    }
  }, [user, isLoaded]);

  // Check Supabase Auth state if configured
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user: supaUser } }) => {
      if (supaUser) {
        const isAdmin = checkIsAdminEmail(supaUser.email || '', supaUser.user_metadata?.role);
        const mappedUser: CustomerUser = {
          id: supaUser.id,
          email: supaUser.email || '',
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Cliente',
          avatar: supaUser.user_metadata?.avatar_url || (isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
          role: isAdmin ? 'admin' : 'customer',
          createdAt: supaUser.created_at,
        };
        setUser(mappedUser);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const isAdmin = checkIsAdminEmail(supaUser.email || '', supaUser.user_metadata?.role);
        setUser({
          id: supaUser.id,
          email: supaUser.email || '',
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Cliente',
          avatar: supaUser.user_metadata?.avatar_url || (isAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
          role: isAdmin ? 'admin' : 'customer',
          createdAt: supaUser.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = (email: string, name?: string, discord?: string): CustomerUser => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(cleanEmail);

    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || (isAdmin ? 'Peti' : cleanEmail.split('@')[0]),
      avatar: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      discord: discord?.trim(),
      role: isAdmin ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const loginWithOAuth = async (provider: 'google' | 'discord') => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      return;
    }

    // Fallback simulation for OAuth in local mode
    const simulatedName = provider === 'google' ? 'Usuario Google' : 'Usuario Discord';
    login(`${provider.toLowerCase()}.user@gmail.com`, simulatedName, `@${provider}_user`);
  };

  const logout = () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = (data: Partial<CustomerUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        loginWithOAuth,
        logout,
        updateProfile,
        isAdmin,
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
