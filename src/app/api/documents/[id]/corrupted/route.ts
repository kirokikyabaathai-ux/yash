/**
 * Document Corruption API Route
 * 
 * PATCH /api/documents/[id]/corrupted
 * Marks a document as corrupted and triggers notification creation.
 * Only accessible by Admin and Office roles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { id: documentId } = await params;
    const supabase = await createClient();

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

    // Only Admin and Office can mark documents as corrupted
    if (userProfile.role !== 'admin' && userProfile.role !== 'office') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
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

    // Update document status to corrupted
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'corrupted' })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update document status' } },
        { status: 500 }
      );
    }

    // Create notification for the uploader
    const uploaderId = document.uploaded_by;
    const leadId = document.lead_id;

    // Get uploader details
    const { data: uploader } = await supabase
      .from('users')
      .select('role')
      .eq('id', uploaderId)
      .single();

    // Create notification for the uploader
    await supabase
      .from('notifications')
      .insert({
        user_id: uploaderId,
        lead_id: leadId,
        type: 'document_corrupted',
        title: 'Document Marked as Corrupted',
        message: `Your uploaded document "${document.file_name}" has been marked as corrupted. Please re-upload a valid document.`,
        read: false,
      });

    // If the uploader is a customer, also notify via the customer account
    if (uploader?.role === 'customer') {
      // Additional notification logic can be added here
    }

    // If document was uploaded by agent, notify the agent
    if (uploader?.role === 'agent') {
      // Additional notification logic can be added here
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        action: 'DOCUMENT_MARKED_CORRUPTED',
        entity_type: 'document',
        entity_id: documentId,
        old_value: { status: 'valid' },
        new_value: { status: 'corrupted' },
      });

    return NextResponse.json({
      message: 'Document marked as corrupted successfully',
      document: { ...document, status: 'corrupted' },
    });
  } catch (error) {
    console.error('Document corruption marking error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
