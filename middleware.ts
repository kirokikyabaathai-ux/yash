/**
 * Next.js Middleware for Authentication and Authorization
 * 
 * This middleware:
 * - Refreshes Supabase sessions on each request
 * - Protects routes based on authentication status
 * - Enforces role-based access control
 * - Redirects users to appropriate dashboards
 */

import { type NextRequest } from 'next/server';
import {
  createMiddlewareClient,
  isProtectedRoute,
  isPublicRoute,
  getAllowedRoles,
  getDashboardRoute,
} from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response, user } = await createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  // If user is authenticated and on homepage, redirect to dashboard
  if (user && pathname === '/') {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role) {
      const dashboardRoute = getDashboardRoute(profile.role);
      return Response.redirect(new URL(dashboardRoute, request.url));
    }
  }

  // If route is public, allow access
  if (isPublicRoute(pathname)) {
    return response;
  }

  // If route is protected, check authentication
  if (isProtectedRoute(pathname)) {
    // If not authenticated, redirect to homepage
    if (!user) {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return Response.redirect(redirectUrl);
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    // If user account is disabled, redirect to homepage with error
    if (profile?.status === 'disabled') {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('error', 'account_disabled');
      return Response.redirect(redirectUrl);
    }

    // Check if user has required role for this route
    const allowedRoles = getAllowedRoles(pathname);
    if (allowedRoles && profile?.role) {
      if (!allowedRoles.includes(profile.role)) {
        // User doesn't have permission, redirect to their dashboard
        const dashboardRoute = getDashboardRoute(profile.role);
        return Response.redirect(new URL(dashboardRoute, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
