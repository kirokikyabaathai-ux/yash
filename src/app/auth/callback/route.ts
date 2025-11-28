/**
 * Auth Callback Route
 * 
 * Handles OAuth callback and email confirmation redirects from Supabase.
 * Exchanges code for session and redirects to appropriate dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    // Get user profile to determine dashboard route
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        let dashboardRoute = '/';
        switch (profile.role) {
          case 'admin':
            dashboardRoute = '/admin/dashboard';
            break;
          case 'office':
            dashboardRoute = '/office/dashboard';
            break;
          case 'agent':
            dashboardRoute = '/agent/dashboard';
            break;
          case 'installer':
            dashboardRoute = '/installer/dashboard';
            break;
          case 'customer':
            dashboardRoute = '/customer/dashboard';
            break;
        }
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }
    }
  }

  // If no code or error, redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}
