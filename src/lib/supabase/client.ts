/**
 * Supabase Client for Client-Side Usage
 * 
 * This client is used in Client Components and browser-side code.
 * It uses ONLY the Supabase anon key with user authentication sessions.
 * All permissions are enforced by RLS policies at the database level.
 * 
 * IMPORTANT: Never use the service role key in client-side code.
 * 
 * NOTE: With NextAuth integration, this client relies on cookie-based
 * session management. For authenticated queries, prefer using server-side
 * API routes which have direct access to NextAuth tokens.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components
 * 
 * This client automatically handles:
 * - Cookie-based session management
 * - Automatic token refresh
 * - RLS policy enforcement
 * 
 * For authenticated operations, prefer using server-side API routes
 * which have direct access to NextAuth session tokens.
 * 
 * @returns Supabase client instance
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
