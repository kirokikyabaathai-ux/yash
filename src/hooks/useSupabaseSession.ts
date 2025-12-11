'use client';

/**
 * Hook to sync NextAuth session with Supabase client session
 * 
 * NOTE: With the current setup using Authorization headers on server-side,
 * client-side session sync is not strictly necessary for API calls.
 * This hook is kept minimal to avoid session sync errors.
 * 
 * If you need client-side Supabase queries with RLS, you'll need to
 * ensure tokens are fresh or use server-side queries instead.
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';

export function useSupabaseSession() {
  const { status } = useSession();

  useEffect(() => {
    const syncSession = async () => {
      const supabase = createClient();

      if (status === 'unauthenticated') {
        // Clear Supabase session when user logs out
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          // Only sign out if there's an active session
          if (currentSession) {
            await supabase.auth.signOut({ scope: 'local' });
          }
        } catch (error) {
          // Silently handle errors during logout
          console.debug('Error clearing Supabase session:', error);
        }
      }
    };

    syncSession();
  }, [status]);
}
