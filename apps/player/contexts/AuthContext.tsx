import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createPlayersService } from '@vms/shared/services';
import { Player } from '@vms/shared/types';
import { usePlayerStore } from '../stores/playerStore';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  playerProfile: Player | null;
  isLoading: boolean;
  refreshPlayerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  playerProfile: null,
  isLoading: true,
  refreshPlayerProfile: async () => {},
});

const playersService = createPlayersService(supabase);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [playerProfile, setPlayerProfile] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setPlayerProfile: storeSetProfile, clearPlayer } = usePlayerStore();

  const fetchPlayerProfile = async (userId: string) => {
    try {
      const profile = await playersService.getPlayer(userId);
      setPlayerProfile(profile);
      storeSetProfile(profile);
    } catch (error) {
      console.error('Error fetching player profile:', error);
      setPlayerProfile(null);
      storeSetProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPlayerProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchPlayerProfile(session.user.id);
        } else {
          setPlayerProfile(null);
          clearPlayer();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshPlayerProfile = async () => {
    if (user) {
      await fetchPlayerProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, playerProfile, isLoading, refreshPlayerProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
