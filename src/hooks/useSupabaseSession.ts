'use client';

/**
 * Hook to sync NextAuth session with Supabase client session
 * 
 * This ensures that the client-side Supabase client always has
 * the correct session tokens from NextAuth, preventing refresh token errors.
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';

export function useSupabaseSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncSession = async () => {
      const supabase = createClient();

      if (status === 'authenticated' && session) {
        const supabaseAccessToken = (session as any).supabaseAccessToken;
        const supabaseRefreshToken = (session as any).supabaseRefreshToken;

        if (supabaseAccessToken && supabaseRefreshToken) {
          try {
            // Set the session in the client-side Supabase client
            const { error } = await supabase.auth.setSession({
              access_token: supabaseAccessToken,
              refresh_token: supabaseRefreshToken,
            });

            if (error) {
              console.error('Failed to set Supabase session from NextAuth:', error);
            } else {
              console.log('Successfully restored Supabase session from NextAuth');
            }
          } catch (error) {
            console.error('Failed to set Supabase session from NextAuth:', error);
          }
        }
      } else if (status === 'unauthenticated') {
        // Clear Supabase session when user logs out
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
          // Ignore errors when clearing session
          console.debug('Error clearing Supabase session:', error);
        }
      }
    };

    syncSession();
  }, [session, status]);
}
