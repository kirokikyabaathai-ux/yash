/**
 * Step Master API Routes - Individual Step
 * 
 * PATCH /api/steps/[id] - Update step
 * DELETE /api/steps/[id] - Delete step
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: stepId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      step_name,
      order_index,
      allowed_roles,
      remarks_required,
      attachments_allowed,
      customer_upload,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (step_name !== undefined) updateData.step_name = step_name;
    if (allowed_roles !== undefined) updateData.allowed_roles = allowed_roles;
    if (remarks_required !== undefined) updateData.remarks_required = remarks_required;
    if (attachments_allowed !== undefined) updateData.attachments_allowed = attachments_allowed;
    if (customer_upload !== undefined) updateData.customer_upload = customer_upload;
    updateData.updated_at = new Date().toISOString();

    // Note: order_index is now managed by the linked list structure via reorder endpoint
    // Direct order_index updates are ignored to prevent conflicts

    // Update step
    const { data: updatedStep, error: updateError } = await supabase
      .from('step_master')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating step:', updateError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to update step' } },
        { status: 500 }
      );
    }

    if (!updatedStep) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Step not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ step: updatedStep });
  } catch (error) {
    console.error('Error in PATCH /api/steps/[id]:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: stepId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Delete step (cascade will handle lead_steps)
    // No need to update order_index of other steps - gaps are fine
    const { error: deleteError } = await supabase
      .from('step_master')
      .delete()
      .eq('id', stepId);

    if (deleteError) {
      console.error('Error deleting step:', deleteError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to delete step' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/steps/[id]:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
