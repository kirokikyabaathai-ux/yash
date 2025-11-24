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
    const { id } = await params;
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
    const { id } = await params;
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
    const { id } = await params;
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

    // Delete user profile
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Delete auth user
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      // Continue even if auth deletion fails
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
