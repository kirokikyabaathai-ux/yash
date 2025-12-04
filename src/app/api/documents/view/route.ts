/**
 * Document View API Route
 * GET - Get signed URL for viewing a document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, file_name, mime_type')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      console.error('Document fetch error:', fetchError);
      console.error('Document ID:', documentId);
      return NextResponse.json(
        { error: 'Document not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    console.log('Found document:', document);

    // First, check if file exists in storage
    const { data: fileList, error: listError } = await supabase.storage
      .from('solar-projects')
      .list(document.file_path.substring(0, document.file_path.lastIndexOf('/')));

    console.log('Files in directory:', fileList);
    console.log('Looking for file:', document.file_path.split('/').pop());

    // Create signed URL (valid for 1 hour)
    console.log('Creating signed URL for path:', document.file_path);
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('solar-projects')
      .createSignedUrl(document.file_path, 3600);

    console.log('Signed URL data:', signedUrlData);
    console.log('Signed URL error:', urlError);

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { 
          error: 'File not found in storage', 
          details: urlError?.message, 
          path: document.file_path,
          suggestion: 'The file may have been deleted. Please re-upload the document.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      fileName: document.file_name,
      mimeType: document.mime_type,
    });
  } catch (error) {
    console.error('Error in document view API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
