/**
 * API Route: Document Metadata
 * POST /api/leads/[id]/documents - Save document metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const leadId = params.id;

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
