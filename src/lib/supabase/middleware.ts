/**
 * Supabase Middleware for Authentication
 * 
 * This middleware handles session refresh and authentication checks.
 * It uses ONLY the Supabase anon key with user authentication sessions.
 * All permissions are enforced by RLS policies at the database level.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Next.js middleware
 * 
 * This client handles:
 * - Session refresh on each request
 * - Cookie management for authentication
 * - RLS policy enforcement
 * 
 * @param request - Next.js request object
 * @returns Object containing Supabase client and response
 */
export async function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // This will automatically refresh the session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, response, user };
}

/**
 * Role-based route protection configuration
 * Maps route patterns to allowed roles
 */
export const PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/office': ['office', 'admin'],
  '/agent': ['agent', 'admin'],
  '/installer': ['installer', 'admin'],
  '/customer': ['customer', 'admin'],
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
] as const;

/**
 * Checks if a route requires authentication
 * 
 * @param pathname - The route pathname to check
 * @returns true if the route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return Object.keys(PROTECTED_ROUTES).some((route) =>
    pathname.startsWith(route)
  );
}

/**
 * Checks if a route is public (no authentication required)
 * 
 * @param pathname - The route pathname to check
 * @returns true if the route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route));
}

/**
 * Gets the allowed roles for a protected route
 * 
 * @param pathname - The route pathname
 * @returns Array of allowed roles or null if not a protected route
 */
export function getAllowedRoles(pathname: string): readonly string[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Gets the dashboard route for a user based on their role
 * 
 * @param role - User's role
 * @returns Dashboard route path
 */
export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'office':
      return '/office/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'installer':
      return '/installer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
}
