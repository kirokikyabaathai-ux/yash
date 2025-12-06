/**
 * API Route: Document Metadata
 * GET /api/leads/[id]/documents - Get documents for a lead (optionally filtered by stepId)
 * POST /api/leads/[id]/documents - Save document metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('stepId');

    // If stepId is provided, get required documents for that step and their statuses
    if (stepId) {
      // Fetch step documents
      const { data: stepDocuments, error: stepDocsError } = await supabase
        .from('step_documents')
        .select('document_category')
        .eq('step_id', stepId);

      if (stepDocsError) {
        console.error('Error fetching step documents:', stepDocsError);
        return NextResponse.json(
          { error: { message: 'Failed to fetch step documents' } },
          { status: 500 }
        );
      }

      // Fetch document statuses for these categories
      const categories = stepDocuments?.map((sd) => sd.document_category) || [];
      
      if (categories.length === 0) {
        return NextResponse.json([]);
      }

      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, document_category, is_submitted, file_name, file_path')
        .eq('lead_id', leadId)
        .in('document_category', categories)
        .eq('status', 'valid');

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        return NextResponse.json(
          { error: { message: 'Failed to fetch documents' } },
          { status: 500 }
        );
      }

      // Create a map of document statuses
      const statusMap = new Map(
        documents?.map((doc) => [doc.document_category, doc]) || []
      );

      // Return status for each required document
      const statuses = categories.map((category) => {
        const doc = statusMap.get(category);
        return {
          document_category: category,
          is_submitted: doc?.is_submitted || false,
          id: doc?.id,
          file_name: doc?.file_name,
          file_path: doc?.file_path,
        };
      });

      return NextResponse.json(statuses);
    }

    // Otherwise, return all documents for the lead
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('lead_id', leadId)
      .eq('status', 'valid')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch documents' } },
        { status: 500 }
      );
    }

    return NextResponse.json(documents || []);
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

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
    const { type, document_category, file_path, file_name, file_size, mime_type } = body;

    // Insert document metadata
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
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
      console.error('Document insert error:', insertError);
      return NextResponse.json(
        { error: { message: 'Failed to save document metadata' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Document metadata error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
