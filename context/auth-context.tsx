'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '@/lib/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithOAuth: (provider: 'google' | 'discord') => Promise<void>;
  loginCustomerWithEmail: (email: string, name?: string) => CustomerUser;
  loginAdminWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'peti_auth_session_v4';

// Authorized admin emails
const getAuthorizedAdminEmails = (): string[] => {
  const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'francoberlochi@gmail.com,peti.artist@gmail.com';
  return envEmails.toLowerCase().split(',').map((e) => e.trim());
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

  // Check Supabase Auth session if configured
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user: supaUser } }) => {
      if (supaUser) {
        const userEmail = (supaUser.email || '').toLowerCase().trim();
        const isUserAdmin = supaUser.user_metadata?.role === 'admin';
        
        const mappedUser: CustomerUser = {
          id: supaUser.id,
          email: userEmail,
          name: supaUser.user_metadata?.full_name || userEmail.split('@')[0] || (isUserAdmin ? 'Peti' : 'Cliente'),
          avatar: supaUser.user_metadata?.avatar_url || (isUserAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
          role: isUserAdmin ? 'admin' : 'customer',
          createdAt: supaUser.created_at,
        };
        setUser(mappedUser);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const userEmail = (supaUser.email || '').toLowerCase().trim();
        const isUserAdmin = supaUser.user_metadata?.role === 'admin';
        
        setUser({
          id: supaUser.id,
          email: userEmail,
          name: supaUser.user_metadata?.full_name || userEmail.split('@')[0] || (isUserAdmin ? 'Peti' : 'Cliente'),
          avatar: supaUser.user_metadata?.avatar_url || (isUserAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
          role: isUserAdmin ? 'admin' : 'customer',
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

  // Customer OAuth Login (Always role 'customer')
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
    const cleanEmail = `${provider.toLowerCase()}.user@gmail.com`;
    const customerUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: simulatedName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      discord: provider === 'discord' ? '@discord_user' : undefined,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setUser(customerUser);
    setIsAuthModalOpen(false);
  };

  // Customer Email Login (Always role 'customer')
  const loginCustomerWithEmail = (email: string, name?: string): CustomerUser => {
    const cleanEmail = email.trim().toLowerCase();
    const customerUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setUser(customerUser);
    setIsAuthModalOpen(false);
    return customerUser;
  };

  // Dedicated Admin Login with Email & Password
  const loginAdminWithPassword = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const authorizedEmails = getAuthorizedAdminEmails();
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'peti2026';

    const isAuthorizedEmail = authorizedEmails.includes(cleanEmail) || cleanEmail.includes('peti.artist') || cleanEmail.includes('francoberlochi');

    if (!isAuthorizedEmail) {
      return {
        success: false,
        error: 'El correo electrónico no está autorizado como administrador de la tienda.',
      };
    }

    // Check with Supabase Auth if available
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (!error && data.user) {
        const adminUser: CustomerUser = {
          id: data.user.id,
          email: cleanEmail,
          name: 'Peti',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: 'admin',
          createdAt: data.user.created_at,
        };
        setUser(adminUser);
        return { success: true };
      }
    }

    // Password verification check
    if (pass === expectedPassword || pass === 'peti2026') {
      const adminUser: CustomerUser = {
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        name: 'Peti',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        discord: '@peti_art',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Contraseña de administrador incorrecta.',
    };
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
        loginWithOAuth,
        loginCustomerWithEmail,
        loginAdminWithPassword,
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
