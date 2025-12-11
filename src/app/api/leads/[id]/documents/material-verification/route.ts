/**
 * API Route: Material Verification Document
 * POST /api/leads/[id]/documents/material-verification - Save material verification data to documents.form_json
 * DELETE /api/leads/[id]/documents/material-verification - Delete material verification document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const supabase = await createClient();
    const { id: leadId } = await params;

    const body = await request.json();
    const { form_data } = body;

    if (!form_data) {
      return NextResponse.json(
        { error: { message: 'Form data is required' } },
        { status: 400 }
      );
    }

    // Check if material verification document already exists
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('lead_id', leadId)
      .eq('document_category', 'material_received')
      .eq('status', 'valid')
      .single();

    let document;

    if (existingDoc) {
      // Update existing document
      const { data: updatedDoc, error: updateError } = await supabase
        .from('documents')
        .update({
          form_json: form_data,
          is_submitted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDoc.id)
        .select()
        .single();

      if (updateError) {
        console.error('Material verification update error:', updateError);
        return NextResponse.json(
          { error: { message: 'Failed to update material verification' } },
          { status: 500 }
        );
      }

      document = updatedDoc;
    } else {
      // Create new document
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          lead_id: leadId,
          type: 'installation',
          document_category: 'material_received',
          file_path: `forms/material_verification_${leadId}.json`,
          file_name: 'Material Verification',
          file_size: JSON.stringify(form_data).length,
          mime_type: 'application/json',
          uploaded_by: user.id,
          status: 'valid',
          form_json: form_data,
          is_submitted: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Material verification insert error:', insertError);
        return NextResponse.json(
          { error: { message: 'Failed to save material verification' } },
          { status: 500 }
        );
      }

      document = newDoc;
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Material verification error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const supabase = await createClient();
    const { id: leadId } = await params;

    // Delete material verification document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('lead_id', leadId)
      .eq('document_category', 'material_received');

    if (deleteError) {
      console.error('Material verification delete error:', deleteError);
      return NextResponse.json(
        { error: { message: 'Failed to delete material verification' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Material verification delete error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
