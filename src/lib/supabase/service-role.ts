/**
 * Supabase Service Role Client
 * 
 * This client bypasses RLS policies and should ONLY be used for:
 * - Administrative operations in API routes
 * - System-level updates that need to bypass user permissions
 * 
 * NEVER expose this client to the browser or client components.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with service role privileges
 * This bypasses all RLS policies - use with caution!
 */
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
