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
 * Creates a new user account via Edge Function.
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

    // Get session token for edge function authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'No valid session',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Get the Supabase URL for edge functions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFIG_ERROR',
            message: 'Supabase URL not configured',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    // Call edge function directly with fetch to get proper error responses
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-user`;
    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name,
        phone: body.phone,
        role: body.role,
        status: body.status || 'active',
        assigned_area: body.assigned_area || null,
      }),
    });

    const responseData = await edgeResponse.json();

    // Handle non-2xx responses with specific error messages
    if (!edgeResponse.ok) {
      console.error('Error from create-user edge function:', responseData);
      
      return NextResponse.json(
        {
          error: {
            code: edgeResponse.status === 409 ? 'CONFLICT' : 
                  edgeResponse.status === 400 ? 'VALIDATION_ERROR' : 
                  'EDGE_FUNCTION_ERROR',
            message: responseData.error || 'Failed to create user',
            details: responseData.details,
            timestamp: new Date().toISOString(),
          },
        },
        { status: edgeResponse.status }
      );
    }

    if (!responseData.success || !responseData.user) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create user',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData.user, { status: 201 });
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
