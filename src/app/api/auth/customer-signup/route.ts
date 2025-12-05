/**
 * Customer Signup API Route (NextAuth Integration)
 * 
 * Handles customer self-registration with NextAuth integration.
 * Creates Supabase Auth account (which triggers lead creation via database trigger),
 * then automatically signs the user in with NextAuth.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signIn } from '@/lib/auth/auth';

// Create Supabase admin client for user creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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

    // Validate name is not empty
    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_NAME', message: 'Please enter your full name' } },
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
    const { data: existingUser } = await supabaseAdmin
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

    // Step 1: Create Supabase Auth account
    // This will trigger the handle_new_user() function which:
    // - Creates a record in the users table
    // - Creates a lead record for customers
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for customer signups
      user_metadata: {
        name,
        phone,
        role: 'customer',
      },
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
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

    // Step 2: Wait for the database trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Verify the user profile was created by the trigger
    const { data: profile, error: profileError } = await supabaseAdmin
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

    // Step 4: Verify the lead was created for the customer
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('customer_account_id', authData.user.id)
      .single();

    if (leadError || !lead) {
      console.error('Lead verification error:', leadError);
      // Don't fail the signup, but log the error
      console.warn('Lead was not created automatically. This may need manual intervention.');
    }

    // Step 5: Return success response
    // The client will then call NextAuth signIn to create the session
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile.name,
        role: profile.role,
      },
      leadCreated: !!lead,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
