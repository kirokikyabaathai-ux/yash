/**
 * Login API Route
 * 
 * Handles user authentication via Supabase Auth.
 * Returns session token and user profile on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: { code: 'AUTH_FAILED', message: authError.message } },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: { code: 'AUTH_FAILED', message: 'Authentication failed' } },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: { code: 'PROFILE_ERROR', message: 'Failed to fetch user profile' } },
        { status: 500 }
      );
    }

    // Check if account is disabled
    if (profile.status === 'disabled') {
      // Sign out the user
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: authData.user,
      profile,
      session: authData.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
