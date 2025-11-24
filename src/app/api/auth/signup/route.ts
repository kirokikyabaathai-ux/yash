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

    // Validate phone number (basic validation)
    if (phone.length < 10) {
      return NextResponse.json(
        { error: { code: 'INVALID_PHONE', message: 'Please enter a valid phone number' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
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

    // Step 2: Create user profile with 'customer' role
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone,
        role: 'customer',
        status: 'active',
      });

    if (profileError) {
      // If profile creation fails, we should clean up the auth account
      // However, Supabase doesn't provide a way to delete users from client
      // This should be handled by admin or a cleanup job
      return NextResponse.json(
        { error: { code: 'PROFILE_ERROR', message: 'Failed to create user profile' } },
        { status: 500 }
      );
    }

    // Step 3: Call link_customer_to_lead RPC function
    // This will either link to existing lead or create a new one
    const { error: linkError } = await supabase.rpc('link_customer_to_lead', {
      p_customer_id: authData.user.id,
      p_phone: phone,
      p_customer_name: name,
      p_email: email,
    });

    if (linkError) {
      console.error('Lead linking error:', linkError);
      // Don't fail the signup if linking fails - user can still access the system
    }

    // Fetch the created profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

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
