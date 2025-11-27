/**
 * API Route: Get Upload URL for Document
 * POST /api/leads/[id]/documents/upload-url
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
    const { fileName, fileSize, mimeType, documentType, documentCategory } = body;

    // Validate file size (9MB limit)
    const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB in bytes
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: 'File size exceeds 9MB limit' } },
        { status: 400 }
      );
    }

    // Generate unique file path
    const fileExtension = fileName.split('.').pop();
    const timestamp = Date.now();
    const filePath = `leads/${leadId}/${documentCategory}_${timestamp}.${fileExtension}`;

    // Get signed upload URL from Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('solar-projects')
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error('Upload URL error:', uploadError);
      return NextResponse.json(
        { error: { message: 'Failed to generate upload URL' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      filePath,
      documentId: crypto.randomUUID(),
    });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
