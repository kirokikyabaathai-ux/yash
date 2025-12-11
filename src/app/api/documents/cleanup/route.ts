/**
 * Document Cleanup API Route
 * POST - Remove orphaned document records (DB records without storage files)
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

    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    // Get all documents for the lead
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, file_path')
      .eq('lead_id', leadId);

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    const orphanedIds: string[] = [];

    // Check each document to see if file exists in storage
    for (const doc of documents || []) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('solar-projects')
        .list(doc.file_path.substring(0, doc.file_path.lastIndexOf('/')), {
          search: doc.file_path.split('/').pop(),
        });

      // If file doesn't exist or error occurred, mark as orphaned
      if (fileError || !fileData || fileData.length === 0) {
        orphanedIds.push(doc.id);
      }
    }

    // Delete orphaned records
    if (orphanedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .in('id', orphanedIds);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      cleaned: orphanedIds.length,
      message: `Removed ${orphanedIds.length} orphaned document record(s)`,
    });
  } catch (error) {
    console.error('Error in cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
