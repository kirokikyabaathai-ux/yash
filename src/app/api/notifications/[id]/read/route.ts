import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database';

/**
 * PATCH /api/notifications/[id]/read
 * 
 * Marks a notification as read for the authenticated user.
 * 
 * Requirements: 19.5
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found',
          },
        },
        { status: 404 }
      );
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this notification',
          },
        },
        { status: 403 }
      );
    }

    // Mark as read
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking notification as read:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to mark notification as read',
            details: updateError,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/notifications/[id]/read:', error);
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
