/**
 * Customer Profile Document Upload API Route
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
    const file = formData.get('file') as File;
    const field = formData.get('field') as string;
    const leadId = formData.get('leadId') as string;

    if (!file || !field) {
      return NextResponse.json(
        { error: 'File and field are required' },
        { status: 400 }
      );
    }

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    // Validate file size (9MB limit)
    const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 9MB limit' },
        { status: 400 }
      );
    }

    // Generate unique file path
    // Format: /leads/{lead_id}/{field}_{timestamp}.{ext}
    const fileExt = file.name.split('.').pop();
    const fileName = `${field}_${Date.now()}.${fileExt}`;
    const filePath = `leads/${leadId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('solar-projects')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file to Supabase Storage:', {
        error,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: 'solar-projects',
      });
      return NextResponse.json({ 
        error: error.message,
        details: {
          code: error.name,
          message: error.message,
          filePath,
        }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      path: data.path,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
