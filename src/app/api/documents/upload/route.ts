/**
 * Document Upload API Route
 * POST - Upload document for a lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const formData = await request.formData();
    const leadId = formData.get('leadId') as string;
    const documentCategory = formData.get('documentCategory') as string;
    const file = formData.get('file') as File;

    if (!leadId || !documentCategory || !file) {
      return NextResponse.json(
        { error: 'leadId, documentCategory, and file are required' },
        { status: 400 }
      );
    }

    // Check for existing document of same category and delete it
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('id, file_path')
      .eq('lead_id', leadId)
      .eq('document_category', documentCategory)
      .eq('type', 'customer');

    // Delete old files from storage and database
    if (existingDocs && existingDocs.length > 0) {
      const filePaths = existingDocs.map((doc) => doc.file_path);
      
      // Delete from storage
      if (filePaths.length > 0) {
        await supabase.storage.from('solar-projects').remove(filePaths);
      }

      // Delete from database
      const docIds = existingDocs.map((doc) => doc.id);
      await supabase.from('documents').delete().in('id', docIds);
    }

    // Create file path: leads/{leadId}/{documentCategory}_{timestamp}.{ext}
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `leads/${leadId}/${documentCategory}_${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    console.log('Uploading file to:', filePath);
    console.log('File size:', buffer.length, 'bytes');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('solar-projects')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('File uploaded successfully:', uploadData);

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        lead_id: leadId,
        type: 'customer',
        document_category: documentCategory,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        status: 'valid',
        is_submitted: true, // Mark as submitted when file is uploaded
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving document metadata:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('solar-projects').remove([filePath]);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Get signed URL (bucket is private)
    const { data: signedUrlData } = await supabase.storage
      .from('solar-projects')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          file_name: file.name,
          file_path: filePath,
          public_url: signedUrlData?.signedUrl || '',
          document_category: documentCategory,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in document upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
