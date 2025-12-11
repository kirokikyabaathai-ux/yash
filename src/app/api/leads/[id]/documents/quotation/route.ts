/**
 * API Route: Quotation Form Document
 * POST /api/leads/[id]/documents/quotation - Save quotation form data to documents.form_json
 * DELETE /api/leads/[id]/documents/quotation - Delete quotation document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { numberToWords } from '@/lib/utils/number-to-words';

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

    // Calculate totalCost and amountInWords
    const systemCost = parseFloat(form_data.systemCost || '0');
    const subsidyAmount = parseFloat(form_data.subsidyAmount || '0');
    const totalCost = systemCost - subsidyAmount;
    const amountInWords = numberToWords(totalCost);

    // Add calculated fields to form_data
    const enrichedFormData = {
      ...form_data,
      totalCost: totalCost.toString(),
      amountInWords: amountInWords,
    };

    // Check if quotation document already exists
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('lead_id', leadId)
      .eq('document_category', 'quotation')
      .eq('status', 'valid')
      .single();

    let document;

    if (existingDoc) {
      // Update existing document
      const { data: updatedDoc, error: updateError } = await supabase
        .from('documents')
        .update({
          form_json: enrichedFormData,
          is_submitted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDoc.id)
        .select()
        .single();

      if (updateError) {
        console.error('Quotation update error:', updateError);
        return NextResponse.json(
          { error: { message: 'Failed to update quotation' } },
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
          document_category: 'quotation',
          file_path: `forms/quotation_${leadId}.json`,
          file_name: 'Quotation Form',
          file_size: JSON.stringify(enrichedFormData).length,
          mime_type: 'application/json',
          uploaded_by: user.id,
          status: 'valid',
          form_json: enrichedFormData,
          is_submitted: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Quotation insert error:', insertError);
        return NextResponse.json(
          { error: { message: 'Failed to save quotation' } },
          { status: 500 }
        );
      }

      document = newDoc;
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Quotation form error:', error);
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

    // Delete quotation document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('lead_id', leadId)
      .eq('document_category', 'quotation');

    if (deleteError) {
      console.error('Quotation delete error:', deleteError);
      return NextResponse.json(
        { error: { message: 'Failed to delete quotation' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quotation delete error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
