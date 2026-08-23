'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '@/lib/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, name?: string, discord?: string, role?: 'customer' | 'admin') => CustomerUser;
  loginAsAdmin: () => CustomerUser;
  loginWithOAuth: (provider: 'google' | 'discord') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'peti_customer_user_v2';

// Default initial user for instant demo testing
const DEFAULT_DEMO_USER: CustomerUser = {
  id: 'usr-alex',
  email: 'alex.rivers@gmail.com',
  name: 'Alex Rivers',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  discord: 'alex_rivers#1337',
  role: 'customer',
  createdAt: '2026-08-01T12:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(DEFAULT_DEMO_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEFAULT_DEMO_USER);
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
        const isAdmin = supaUser.email?.includes('peti') || supaUser.user_metadata?.role === 'admin';
        const mappedUser: CustomerUser = {
          id: supaUser.id,
          email: supaUser.email || '',
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Cliente',
          avatar: supaUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: isAdmin ? 'admin' : 'customer',
          createdAt: supaUser.created_at,
        };
        setUser(mappedUser);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const isAdmin = supaUser.email?.includes('peti') || supaUser.user_metadata?.role === 'admin';
        setUser({
          id: supaUser.id,
          email: supaUser.email || '',
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Cliente',
          avatar: supaUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
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

  const login = (email: string, name?: string, discord?: string, role: 'customer' | 'admin' = 'customer'): CustomerUser => {
    const isPetiAdmin = email.toLowerCase().includes('peti') || role === 'admin';
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name?.trim() || (isPetiAdmin ? 'Peti' : email.split('@')[0]),
      avatar: isPetiAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      discord: discord?.trim(),
      role: isPetiAdmin ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const loginAsAdmin = (): CustomerUser => {
    return login('peti.artist@gmail.com', 'Peti (Admin)', '@peti_art', 'admin');
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
    login(`${provider.toLowerCase()}.user@example.com`, simulatedName, `@${provider}_user`, 'customer');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        loginAsAdmin,
        loginWithOAuth,
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
