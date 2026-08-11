import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { createAuthService } from '@vms/shared/services';

const authService = createAuthService(supabase);

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signInWithOtp = async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.signInWithOtp(phone);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.verifyOtp(phone, token);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithOtp,
    verifyOtp,
    signOut,
    loading,
    error,
  };
}
