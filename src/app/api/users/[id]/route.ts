/**
 * User API Routes - GET, PATCH, DELETE for individual users
 * 
 * Handles retrieving, updating, and deleting user accounts.
 * Restricted to admin role only.
 * 
 * Requirements: 1.2, 1.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

/**
 * GET /api/users/[id]
 * 
 * Retrieves a specific user by ID.
 * Admin only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
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

    const { id } = await params;
    const supabase = await createClient();

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

    // Get the requested user
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * 
 * Updates a user account.
 * Admin only.
 * 
 * Requirements: 1.2 (Role Assignment), 1.4 (Disable Account)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
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

    const { id } = await params;
    const supabase = await createClient();

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

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      updates.name = body.name;
    }

    if (body.phone !== undefined) {
      updates.phone = body.phone;
    }

    if (body.role !== undefined) {
      // Validate role
      const validRoles = ['admin', 'agent', 'office', 'installer', 'customer'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid role',
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }
      updates.role = body.role;
    }

    if (body.status !== undefined) {
      // Requirement 1.4: Admin can disable/enable user accounts
      const validStatuses = ['active', 'disabled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid status',
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.assigned_area !== undefined) {
      updates.assigned_area = body.assigned_area || null;
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update user',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * 
 * Deletes a user account.
 * Admin only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
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

    const { id } = await params;
    const supabase = await createClient();

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

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot delete your own account',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

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

    // Call edge function to delete user
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: {
        userId: id,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error calling delete-user edge function:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message || 'Failed to delete user',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: data.error || 'Failed to delete user',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete user',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
