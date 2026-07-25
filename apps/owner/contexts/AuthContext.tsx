import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createOwnersService } from '@vms/shared/services';
import { Owner } from '@vms/shared/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  ownerProfile: Owner | null;
  isLoading: boolean;
  refreshOwnerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  ownerProfile: null,
  isLoading: true,
  refreshOwnerProfile: async () => {},
});

const ownersService = createOwnersService(supabase);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOwnerProfile = async (userId: string) => {
    try {
      const profile = await ownersService.getOwner(userId);
      setOwnerProfile(profile);
    } catch (error) {
      console.error('Error fetching owner profile:', error);
      setOwnerProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOwnerProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchOwnerProfile(session.user.id);
        } else {
          setOwnerProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshOwnerProfile = async () => {
    if (user) {
      await fetchOwnerProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, ownerProfile, isLoading, refreshOwnerProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
