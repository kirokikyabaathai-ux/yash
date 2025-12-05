"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import { Session } from "next-auth";

/**
 * Client-side authentication utilities
 */

/**
 * Custom hook to access session data in Client Components
 * This wraps NextAuth's useSession hook with additional utilities
 * @returns Object containing session data, loading state, and helper functions
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    status,
    update,
  };
}

/**
 * Hook to get the current user from the session
 * @returns The current user or null if not authenticated
 */
export function useCurrentUser() {
  const { user } = useSession();
  return user;
}

/**
 * Hook to get the current user's ID
 * @returns The current user's ID or null if not authenticated
 */
export function useCurrentUserId(): string | null {
  const { user } = useSession();
  return user?.id ?? null;
}

/**
 * Hook to get the current user's role
 * @returns The current user's role or null if not authenticated
 */
export function useCurrentUserRole(): string | null {
  const { user } = useSession();
  return user?.role ?? null;
}

/**
 * Hook to check if the current user has a specific role
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function useHasRole(role: string): boolean {
  const userRole = useCurrentUserRole();
  return userRole === role;
}

/**
 * Hook to check if the current user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns True if the user has any of the roles, false otherwise
 */
export function useHasAnyRole(roles: string[]): boolean {
  const userRole = useCurrentUserRole();
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Hook to check if the user is authenticated
 * @returns True if authenticated, false otherwise
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useSession();
  return isAuthenticated;
}

/**
 * Hook to check if the session is loading
 * @returns True if loading, false otherwise
 */
export function useIsSessionLoading(): boolean {
  const { isLoading } = useSession();
  return isLoading;
}

/**
 * Type guard to check if a session exists
 * @param session - The session to check
 * @returns True if session exists and has a user
 */
export function isAuthenticated(session: Session | null): session is Session {
  return !!session?.user;
}

/**
 * Type guard to check if a user has a specific role
 * @param session - The session to check
 * @param role - The role to check for
 * @returns True if the user has the specified role
 */
export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.role === role;
}

/**
 * Type guard to check if a user has any of the specified roles
 * @param session - The session to check
 * @param roles - Array of roles to check for
 * @returns True if the user has any of the specified roles
 */
export function hasAnyRole(session: Session | null, roles: string[]): boolean {
  return session?.user?.role ? roles.includes(session.user.role) : false;
}
