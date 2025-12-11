/**
 * API Route: Step Documents
 * GET /api/steps/[id]/documents - Get required documents for a step
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { id: stepId } = await params;

    // Fetch step documents
    const { data: stepDocuments, error } = await supabase
      .from('step_documents')
      .select('*')
      .eq('step_id', stepId);

    if (error) {
      console.error('Error fetching step documents:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch step documents' } },
        { status: 500 }
      );
    }

    return NextResponse.json(stepDocuments || []);
  } catch (error) {
    console.error('Step documents error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
