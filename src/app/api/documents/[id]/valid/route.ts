/**
 * Document Validation API Route
 * 
 * PATCH /api/documents/[id]/valid
 * Marks a document as valid (removes corrupted status).
 * Only accessible by Admin role.
 * 
 * Requirements: 11.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const supabase = await createClient();

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

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User profile not found' } },
        { status: 404 }
      );
    }

    // Only Admin can mark documents as valid
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Get document metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, leads!inner(customer_account_id)')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      );
    }

    const oldStatus = document.status;

    // Update document status to valid
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'valid' })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update document status' } },
        { status: 500 }
      );
    }

    // Create notification for the uploader if status changed
    if (oldStatus === 'corrupted') {
      const uploaderId = document.uploaded_by;
      const leadId = document.lead_id;

      await supabase.from('notifications').insert({
        user_id: uploaderId,
        lead_id: leadId,
        type: 'document_validated',
        title: 'Document Validated',
        message: `Your document "${document.file_name}" has been validated and marked as valid by an administrator.`,
        read: false,
      });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      lead_id: document.lead_id,
      user_id: user.id,
      action: 'DOCUMENT_MARKED_VALID',
      entity_type: 'document',
      entity_id: documentId,
      old_value: { status: oldStatus },
      new_value: { status: 'valid' },
    });

    return NextResponse.json({
      message: 'Document marked as valid successfully',
      document: { ...document, status: 'valid' },
    });
  } catch (error) {
    console.error('Document validation marking error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
