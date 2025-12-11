/**
 * Document Delete API Route
 * DELETE - Delete a document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

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
      .select('file_path, lead_id')
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

    console.log('Found document to delete:', document);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('solar-projects')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { data: deletedData, error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .select();

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log('Deleted from database:', deletedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Document deleted successfully',
        deleted: deletedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in document delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
