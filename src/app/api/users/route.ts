/**
 * Users API Routes - GET (list) and POST (create)
 * 
 * Handles listing users and creating new user accounts.
 * Restricted to admin role only.
 * 
 * Requirements: 1.2, 1.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users
 * 
 * Lists all users in the system.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'User profile not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch users',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 
 * Creates a new user account.
 * Admin only.
 * 
 * Requirements: 1.2 (Role Assignment Uniqueness)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'User profile not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!body.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!body.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!body.phone?.trim()) {
      errors.push({ field: 'phone', message: 'Phone is required' });
    }

    if (!body.role) {
      errors.push({ field: 'role', message: 'Role is required' });
    }

    if (!body.password || body.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    // Validate role is one of the allowed values
    const validRoles = ['admin', 'agent', 'office', 'installer', 'customer'];
    if (body.role && !validRoles.includes(body.role)) {
      errors.push({ field: 'role', message: 'Invalid role' });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { errors },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Create auth user using admin API
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (createAuthError) {
      throw createAuthError;
    }

    if (!authUser.user) {
      throw new Error('Failed to create auth user');
    }

    // Create user profile
    // Requirement 1.2: Assign exactly one role from the valid role set
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: body.email,
        name: body.name,
        phone: body.phone,
        role: body.role, // Exactly one role assigned
        status: body.status || 'active',
        assigned_area: body.assigned_area || null,
      })
      .select()
      .single();

    if (createUserError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw createUserError;
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create user',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
