import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import { Database } from '@/types/database';

/**
 * GET /api/notifications
 * 
 * Fetches notifications for the authenticated user.
 * Filters by user_id automatically through RLS.
 * 
 * Requirements: 19.4, 19.5
 */
export async function GET(request: Request) {
  try {
    // Check authentication with NextAuth
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by read status if requested
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch notifications',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Unexpected error in GET /api/notifications:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
