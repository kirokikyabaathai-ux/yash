/**
 * Supabase Service Role Client
 * 
 * ⚠️ SECURITY CRITICAL - READ BEFORE USING ⚠️
 * 
 * This client bypasses ALL RLS policies and has FULL database access.
 * 
 * ONLY use in:
 * ✅ Server Components (app directory pages)
 * ✅ API Routes (app/api/*)
 * ✅ Server Actions
 * ✅ Middleware (server-side only)
 * 
 * NEVER use in:
 * ❌ Client Components ('use client')
 * ❌ Browser-side code
 * ❌ Any file that gets bundled for the client
 * 
 * SECURITY REQUIREMENTS:
 * 1. Always verify authentication BEFORE using this client
 * 2. Always filter queries by authenticated user ID
 * 3. Never expose service role key in client-side code
 * 4. Never return raw database errors to client
 * 
 * Example safe usage:
 * ```typescript
 * const session = await auth(); // 1. Verify auth
 * if (!session?.user) return unauthorized();
 * 
 * const supabase = createServiceRoleClient();
 * const { data } = await supabase
 *   .from('table')
 *   .select('*')
 *   .eq('user_id', session.user.id); // 2. Filter by user
 * ```
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with service role privileges
 * 
 * ⚠️ BYPASSES ALL RLS POLICIES - USE WITH EXTREME CAUTION ⚠️
 * 
 * This client has full database access. You MUST:
 * 1. Verify authentication before calling this
 * 2. Manually filter all queries by user ID
 * 3. Only use in server-side code (never client components)
 * 
 * @returns Supabase client with service role privileges
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 */
export function createServiceRoleClient() {
  // Runtime check to ensure we're on the server
  if (typeof window !== 'undefined') {
    throw new Error(
      '🚨 SECURITY ERROR: createServiceRoleClient() called in browser context! ' +
      'This function can only be used in server-side code (Server Components, API Routes, Server Actions). ' +
      'Never import this in client components.'
    );
  }

  // Verify service role key exists
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. ' +
      'This is required for service role client operations.'
    );
  }

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
