'use client';

/**
 * Supabase Session Sync Component
 * 
 * This component syncs the NextAuth session with the client-side Supabase client.
 * It must be rendered within the SessionProvider to access the NextAuth session.
 */

import { useSupabaseSession } from '@/hooks/useSupabaseSession';

export function SupabaseSessionSync() {
  useSupabaseSession();
  return null;
}
