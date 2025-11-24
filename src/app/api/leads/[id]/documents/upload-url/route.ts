/**
 * Document Upload URL API Route
 * 
 * POST /api/leads/[id]/documents/upload-url
 * Generates a signed upload URL for direct file upload to Supabase Storage.
 * Integrates with the get-upload-url edge function.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User profile not found' } },
        { status: 404 }
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
    const { fileName, fileSize, mimeType, documentType, documentCategory } = body;

    // Validate required fields
    if (!fileName || !fileSize || !mimeType || !documentType || !documentCategory) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds 10MB limit' } },
        { status: 413 }
      );
    }

    // Generate unique file path
    const fileExtension = fileName.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const filePath = `leads/${leadId}/${documentType}/${uniqueId}.${fileExtension}`;

    // Get signed upload URL from Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('solar-projects')
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData) {
      console.error('Error creating signed upload URL:', uploadError);
      return NextResponse.json(
        { error: { code: 'UPLOAD_URL_FAILED', message: 'Failed to generate upload URL' } },
        { status: 500 }
      );
    }

    // Generate a document ID for tracking
    const documentId = crypto.randomUUID();

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      filePath,
      documentId,
      expiresAt: Date.now() + 3600000, // 1 hour from now
    });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
