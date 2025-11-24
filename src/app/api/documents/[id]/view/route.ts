/**
 * Document View API Route
 * 
 * GET /api/documents/[id]/view
 * Generates a signed URL for viewing/downloading a document.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get document metadata (RLS will ensure user has access)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found or access denied' } },
        { status: 404 }
      );
    }

    // Generate signed URL for viewing (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('solar-projects')
      .createSignedUrl(document.file_path, 3600);

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { error: { code: 'URL_GENERATION_FAILED', message: 'Failed to generate view URL' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      document,
    });
  } catch (error) {
    console.error('Document view error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
