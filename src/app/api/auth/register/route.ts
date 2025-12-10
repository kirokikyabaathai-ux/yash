/**
 * Registration API Route for NextAuth
 * 
 * Handles customer self-registration with NextAuth integration.
 * Creates user profile with hashed password and links to existing lead or creates new one.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */
"use server"
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Create Supabase client with service role for user creation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role: 'customer',
      },
    });

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: { code: 'SIGNUP_FAILED', message: authError?.message || 'Failed to create account' } },
        { status: 400 }
      );
    }

    // Create user profile in users table
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
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: { code: 'PROFILE_ERROR', message: 'Failed to create user profile' } },
        { status: 500 }
      );
    }

    // Call link_customer_to_lead RPC function
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

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        name,
        role: 'customer',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
