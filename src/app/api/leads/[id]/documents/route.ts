/**
 * Documents API Route
 * 
 * GET /api/leads/[id]/documents - List all documents for a lead
 * POST /api/leads/[id]/documents - Record document metadata after upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Verify lead exists and user has access (RLS will handle this)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: { code: 'LEAD_NOT_FOUND', message: 'Lead not found or access denied' } },
        { status: 404 }
      );
    }

    // Get documents for the lead (RLS policies will filter based on user role)
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('lead_id', leadId)
      .order('uploaded_at', { ascending: false });

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return NextResponse.json(
        { error: { code: 'FETCH_FAILED', message: 'Failed to fetch documents' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Verify lead exists and user has access (RLS will handle this)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: { code: 'LEAD_NOT_FOUND', message: 'Lead not found or access denied' } },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      documentId,
      type,
      document_category,
      file_path,
      file_name,
      file_size,
      mime_type,
    } = body;

    // Validate required fields
    if (!type || !document_category || !file_path || !file_name || !file_size || !mime_type) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Insert document metadata
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        lead_id: leadId,
        type,
        document_category,
        file_path,
        file_name,
        file_size,
        mime_type,
        uploaded_by: user.id,
        status: 'valid',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting document metadata:', insertError);
      return NextResponse.json(
        { error: { code: 'INSERT_FAILED', message: 'Failed to save document metadata' } },
        { status: 500 }
      );
    }

    // Check if all mandatory documents are uploaded and trigger status update
    const { data: mandatoryDocs } = await supabase
      .from('documents')
      .select('document_category')
      .eq('lead_id', leadId)
      .eq('type', 'mandatory')
      .eq('status', 'valid');

    const requiredCategories = [
      'aadhar_front',
      'aadhar_back',
      'bijli_bill',
      'bank_passbook',
      'cancelled_cheque',
      'pan_card',
    ];

    const uploadedCategories = new Set(mandatoryDocs?.map(d => d.document_category) || []);
    const allMandatoryUploaded = requiredCategories.every(cat => uploadedCategories.has(cat));

    if (allMandatoryUploaded) {
      // Check if PM Suryaghar form is also submitted
      const { data: pmForm } = await supabase
        .from('pm_suryaghar_form')
        .select('id')
        .eq('lead_id', leadId)
        .single();

      if (pmForm) {
        // Update lead status to interested
        await supabase
          .from('leads')
          .update({ status: 'interested' })
          .eq('id', leadId);
      }
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
