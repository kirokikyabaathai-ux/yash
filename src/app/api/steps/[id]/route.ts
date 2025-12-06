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
import { auth } from '@/lib/auth/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stepId } = await params;

    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!session || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user account is disabled
    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Account disabled' } },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Use regular client - RLS policies handle admin-only write access
    const supabase = await createClient();

    // Parse request body
    const body = await request.json();
    const {
      step_name,
      order_index,
      allowed_roles,
      remarks_required,
      attachments_allowed,
      customer_upload,
      requires_installer_assignment,
      step_documents,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (step_name !== undefined) updateData.step_name = step_name;
    if (allowed_roles !== undefined) updateData.allowed_roles = allowed_roles;
    if (remarks_required !== undefined) updateData.remarks_required = remarks_required;
    if (attachments_allowed !== undefined) updateData.attachments_allowed = attachments_allowed;
    if (customer_upload !== undefined) updateData.customer_upload = customer_upload;
    if (requires_installer_assignment !== undefined) updateData.requires_installer_assignment = requires_installer_assignment;
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

    // Handle step_documents if provided
    if (step_documents !== undefined && Array.isArray(step_documents)) {
      // Delete existing step_documents
      await supabase
        .from('step_documents')
        .delete()
        .eq('step_id', stepId);

      // Insert new step_documents
      if (step_documents.length > 0) {
        const documentsToInsert = step_documents.map((doc: any) => ({
          step_id: stepId,
          document_category: doc.document_category,
          submission_type: doc.submission_type || 'file',
        }));

        const { error: docsError } = await supabase
          .from('step_documents')
          .insert(documentsToInsert);

        if (docsError) {
          console.error('Error updating step documents:', docsError);
          // Don't fail the whole operation, just log the error
        }
      }
    }

    // Fetch the complete step with documents
    const { data: completeStep } = await supabase
      .from('step_master')
      .select(`
        *,
        step_documents (
          id,
          document_category,
          submission_type
        )
      `)
      .eq('id', stepId)
      .single();

    return NextResponse.json({ step: completeStep || updatedStep });
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
    const { id: stepId } = await params;

    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!session || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user account is disabled
    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Account disabled' } },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Use regular client - RLS policies handle admin-only write access
    const supabase = await createClient();

    // Delete step (cascade will handle lead_steps)
    // No need to update order_index of other steps - gaps are fine
    const { data, error: deleteError } = await supabase
      .from('step_master')
      .delete()
      .eq('id', stepId)
      .select();

    if (deleteError) {
      console.error('Error deleting step:', deleteError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to delete step' } },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Step not found' } },
        { status: 404 }
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
