/**
 * PPA Document API Route
 * Handles saving and deleting PPA form data to/from documents table
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const { form_data } = body;

    if (!form_data) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if PPA document already exists for this lead
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('lead_id', leadId)
      .eq('document_category', 'ppa')
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
        console.error('PPA update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update PPA document' },
          { status: 500 }
        );
      }

      document = updatedDoc;
    } else {
      // Insert new PPA document
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          lead_id: leadId,
          type: 'mandatory',
          document_category: 'ppa',
          file_path: `forms/ppa_${leadId}.json`,
          file_name: `PPA_${form_data.prosumerName}_${form_data.agreementDate}`,
          file_size: JSON.stringify(form_data).length,
          mime_type: 'application/json',
          uploaded_by: session.user.id,
          status: 'valid',
          form_json: form_data,
          is_submitted: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('PPA insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save PPA document', details: insertError.message },
          { status: 500 }
        );
      }

      document = newDoc;
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error in PPA POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const supabase = await createClient();

    // Delete PPA document for this lead
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('lead_id', leadId)
      .eq('document_category', 'ppa');

    if (deleteError) {
      console.error('PPA delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete PPA document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in PPA DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
