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
import { auth } from '@/lib/auth/auth';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Server Components and API Routes
 * 
 * Uses NextAuth session tokens directly via Authorization header.
 * This avoids setSession/refreshSession calls that can fail.
 * 
 * @returns Supabase client instance with server-side cookie handling
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Get NextAuth session with Supabase tokens
  let supabaseAccessToken: string | undefined;
  
  try {
    const session = await auth();
    supabaseAccessToken = (session as any)?.supabaseAccessToken;
  } catch (error) {
    // Ignore - will use cookie-based auth
  }

  // If we have a token from NextAuth, create client with Authorization header
  // This bypasses the need for setSession/refreshSession which can fail
  if (supabaseAccessToken) {
    const client = createServerClient<Database>(
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
              // Ignore in Server Components
            }
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        },
      }
    );
    return client;
  }

  // Fallback: cookie-based auth (for cases without NextAuth session)
  const client = createServerClient<Database>(
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
            // Ignore in Server Components
          }
        },
      },
    }
  );

  return client;
}

/**
 * Creates a Supabase client with Supabase Auth session from NextAuth
 * 
 * This restores the Supabase Auth session so RLS policies work correctly.
 * Use this when you need RLS to work with NextAuth authentication.
 * 
 * @param accessToken - Supabase access token from NextAuth session
 * @returns Supabase client with auth session set
 */
export async function createClientWithSession(accessToken: string) {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
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
            // Ignore
          }
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  return client;
}

/**
 * Creates a Supabase client with auth context for NextAuth users
 * 
 * ⚠️ SECURITY: This uses service role and bypasses RLS policies ⚠️
 * ⚠️ CURRENTLY UNUSED - Commented out to avoid requiring service role key in builds
 * 
 * This function provides a safer interface for NextAuth integration by:
 * 1. Requiring explicit user ID parameter
 * 2. Adding runtime checks for server-side execution
 * 3. Documenting security requirements
 * 
 * SECURITY REQUIREMENTS:
 * - MUST verify authentication before calling this function
 * - MUST filter all queries by the provided userId
 * - ONLY use in server-side code (Server Components, API Routes)
 * 
 * Why we need this:
 * - RLS policies use auth.uid() which requires Supabase Auth
 * - Your app uses NextAuth, so auth.uid() returns null
 * - Service role bypasses RLS, but you must manually filter by userId
 * 
 * Example usage:
 * ```typescript
 * const session = await auth();
 * if (!session?.user) return unauthorized();
 * 
 * const supabase = createClientWithAuth(session.user.id);
 * const { data } = await supabase
 *   .from('leads')
 *   .select('*')
 *   .eq('customer_account_id', session.user.id); // Must filter!
 * ```
 * 
 * @param userId - The user ID from NextAuth session (session.user.id)
 * @returns Supabase client with service role (RLS bypassed)
 * @throws Error if called in browser context
 */
/*
export function createClientWithAuth(userId: string) {
  // Runtime check to ensure we're on the server
  if (typeof window !== 'undefined') {
    throw new Error(
      '🚨 SECURITY ERROR: createClientWithAuth() called in browser context! ' +
      'This function can only be used in server-side code.'
    );
  }

  // Validate userId parameter
  if (!userId || typeof userId !== 'string') {
    throw new Error(
      'createClientWithAuth() requires a valid userId parameter. ' +
      'Pass session.user.id from NextAuth session.'
    );
  }

  // Check if service role key is available
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. ' +
      'This is required for createClientWithAuth(). ' +
      'Add it to your .env.local file or deployment environment.'
    );
  }

  // Use service role client which bypasses RLS
  // The caller is responsible for filtering queries by userId
  const client = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return client;
}
*/
