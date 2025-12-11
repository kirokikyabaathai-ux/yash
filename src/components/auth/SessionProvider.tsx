"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SupabaseSessionSync } from "./SupabaseSessionSync";

/**
 * SessionProvider wrapper component
 * 
 * Wraps the application with NextAuth's SessionProvider to enable
 * session management across the application.
 * 
 * Features:
 * - Provides session context to all child components
 * - Configures session refresh interval (5 minutes)
 * - Enables automatic session updates
 * - Syncs NextAuth session with Supabase client
 * 
 * Requirements: 3.1, 3.2
 */

interface SessionProviderProps {
  children: ReactNode;
  session?: any;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      session={session}
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch session when window regains focus
      refetchOnWindowFocus={true}
    >
      <SupabaseSessionSync />
      {children}
    </NextAuthSessionProvider>
  );
}
