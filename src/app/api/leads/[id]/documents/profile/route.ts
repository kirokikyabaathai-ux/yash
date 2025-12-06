/**
 * API Route: Profile Form Document
 * POST /api/leads/[id]/documents/profile - Save profile form data to documents.form_json
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leadId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { form_data } = body;

    if (!form_data) {
      return NextResponse.json(
        { error: { message: 'Form data is required' } },
        { status: 400 }
      );
    }

    // Check if profile document already exists
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('lead_id', leadId)
      .eq('document_category', 'profile')
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
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: { message: 'Failed to update profile' } },
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
          type: 'mandatory',
          document_category: 'profile',
          file_path: `forms/profile_${leadId}.json`, // Virtual path for form submissions
          file_name: 'Customer Profile Form',
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
        console.error('Profile insert error:', insertError);
        return NextResponse.json(
          { error: { message: 'Failed to save profile' } },
          { status: 500 }
        );
      }

      document = newDoc;
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Profile form error:', error);
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
    const supabase = await createClient();
    const { id: leadId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Delete profile document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('lead_id', leadId)
      .eq('document_category', 'profile');

    if (deleteError) {
      console.error('Profile delete error:', deleteError);
      return NextResponse.json(
        { error: { message: 'Failed to delete profile' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile delete error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
