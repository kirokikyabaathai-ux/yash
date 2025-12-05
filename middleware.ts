/**
 * Next.js Middleware for Authentication and Authorization
 * 
 * This middleware:
 * - Validates NextAuth sessions on each request
 * - Protects routes based on authentication status
 * - Enforces role-based access control
 * - Redirects users to appropriate dashboards
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  isProtectedRoute,
  isPublicRoute,
  getAllowedRoles,
  getDashboardRoute,
} from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get session from NextAuth
  const session = await auth();
  const user = session?.user;

  // If user is authenticated and on homepage, redirect to dashboard
  if (user && pathname === '/') {
    if (user.role) {
      const dashboardRoute = getDashboardRoute(user.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
  }

  // If route is public, allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If route is protected, check authentication
  if (isProtectedRoute(pathname)) {
    // If not authenticated, redirect to homepage
    if (!user) {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user account is disabled, redirect to homepage with error
    if (user.status === 'disabled') {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('error', 'account_disabled');
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has required role for this route
    const allowedRoles = getAllowedRoles(pathname);
    
    if (allowedRoles && user.role) {
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have permission, redirect to their dashboard
        const dashboardRoute = getDashboardRoute(user.role);
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }
    }
  }

  return NextResponse.next();
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
