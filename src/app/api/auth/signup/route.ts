/**
 * Signup API Route
 * 
 * Handles customer self-registration.
 * Creates Supabase Auth account, user profile, and links to existing lead or creates new one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validate input
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'All fields are required' } },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 8 characters long' } },
        { status: 400 }
      );
    }

    // Validate phone number (exactly 10 digits, cannot start with 0)
    const phoneRegex = /^[1-9][0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: { code: 'INVALID_PHONE', message: 'Phone number must be exactly 10 digits and cannot start with 0' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: 'customer',
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: { code: 'SIGNUP_FAILED', message: authError.message } },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: { code: 'SIGNUP_FAILED', message: 'Failed to create account' } },
        { status: 400 }
      );
    }

    // Step 2: The trigger handle_new_user() automatically creates the user profile and lead
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the user profile was created by the trigger
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile verification error:', profileError);
      return NextResponse.json(
        { error: { code: 'PROFILE_ERROR', message: 'Failed to create user profile' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: authData.user,
      profile,
      session: authData.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
