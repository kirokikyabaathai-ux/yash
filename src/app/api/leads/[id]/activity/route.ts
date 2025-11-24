/**
 * Activity Log API Route
 * 
 * GET /api/leads/[id]/activity - Get activity logs for a specific lead
 * 
 * Supports filtering and pagination.
 * Restricted to admin and office roles.
 * Requirements: 12.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const leadId = params.id;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Restrict to admin and office roles
    if (userData.role !== 'admin' && userData.role !== 'office') {
      return NextResponse.json(
        { error: 'Forbidden: Only admin and office roles can access activity logs' },
        { status: 403 }
      );
    }

    // Parse query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const actionType = searchParams.get('actionType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('activity_log')
      .select(
        `
        *,
        user:users!activity_log_user_id_fkey(name, email, role)
      `,
        { count: 'exact' }
      )
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (actionType) {
      query = query.ilike('action', `%${actionType}%`);
    }
    if (dateFrom) {
      query = query.gte('timestamp', dateFrom);
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo);
    }

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in activity log API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
