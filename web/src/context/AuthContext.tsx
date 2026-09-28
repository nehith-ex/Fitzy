import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured) {
        // Check if demo user was active
        const storedDemo = sessionStorage.getItem('fitzy_demo_user');
        if (storedDemo && mounted) {
          try {
            const parsed = JSON.parse(storedDemo);
            setUser(parsed.user);
            setProfile(parsed.profile);
          } catch {
            // ignore
          }
        }
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user.email);
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    // Listen for auth state changes if configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      subscription = authListener.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if row is not created yet
        const defaultName = email ? email.split('@')[0] : 'Athlete';
        setProfile({
          id: userId,
          display_name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        });
      }
    } catch {
      const defaultName = email ? email.split('@')[0] : 'Athlete';
      setProfile({
        id: userId,
        display_name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // In preview when Supabase env vars are missing, provide local test session
      const mockId = 'demo-user-id';
      const mockUser = {
        id: mockId,
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      const mockProfile: Profile = {
        id: mockId,
        display_name: email.split('@')[0],
      };
      sessionStorage.setItem('fitzy_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isSupabaseConfigured) {
      const mockId = 'demo-user-id';
      const mockUser = {
        id: mockId,
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      const mockProfile: Profile = {
        id: mockId,
        display_name: displayName || email.split('@')[0],
      };
      sessionStorage.setItem('fitzy_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (!error && data?.user && displayName) {
      // Attempt creating profile row
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: displayName,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not insert profile row:', err);
      }
    }

    return { error: error as Error | null };
  };

  const signInDemo = () => {
    const mockId = 'demo-user-id';
    const mockUser = {
      id: mockId,
      email: 'demo@fitzy.app',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    const mockProfile: Profile = {
      id: mockId,
      display_name: 'Alex',
    };
    sessionStorage.setItem('fitzy_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
    setUser(mockUser);
    setProfile(mockProfile);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('fitzy_demo_user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInDemo,
        signOut,
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
