/**
 * Supabase Client for Server-Side Usage
 * 
 * This client is used in Server Components, API Routes, and Server Actions.
 * It uses ONLY the Supabase anon key with user authentication sessions.
 * All permissions are enforced by RLS policies at the database level.
 * 
 * IMPORTANT: Never use the service role key in Next.js application code.
 * Service role key should only be used in Supabase Edge Functions and tests.
 * 
 * NOTE: With NextAuth integration, this client still maintains Supabase Auth
 * sessions for RLS policy enforcement. The NextAuth session provides the
 * authentication layer, while Supabase Auth sessions enable RLS.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Server Components and API Routes
 * 
 * This client automatically handles:
 * - Cookie-based session management from Next.js cookies
 * - Automatic token refresh
 * - RLS policy enforcement based on authenticated user
 * 
 * With NextAuth integration:
 * - NextAuth handles authentication and session management
 * - Supabase Auth sessions are maintained for RLS policy enforcement
 * - The user ID from NextAuth session matches the Supabase Auth user ID
 * 
 * @returns Supabase client instance with server-side cookie handling
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
