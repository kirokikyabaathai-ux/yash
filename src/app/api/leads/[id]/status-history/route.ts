/**
 * API Route: Get Lead Status History
 * GET /api/leads/[id]/status-history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leadId } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Check access to lead
    const { data: lead } = await supabase
      .from('leads')
      .select('id, customer_account_id, created_by')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return NextResponse.json(
        { error: { message: 'Lead not found' } },
        { status: 404 }
      );
    }

    // Check permissions
    const canView = 
      userData.role === 'admin' ||
      userData.role === 'office' ||
      (userData.role === 'customer' && lead.customer_account_id === user.id) ||
      (userData.role === 'agent' && lead.created_by === user.id);

    if (!canView) {
      return NextResponse.json(
        { error: { message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Fetch status change history from activity_log
    const { data: activities, error: activityError } = await supabase
      .from('activity_log')
      .select(`
        id,
        timestamp,
        new_value,
        user:users!activity_log_user_id_fkey(name)
      `)
      .eq('lead_id', leadId)
      .eq('action', 'status_change')
      .order('timestamp', { ascending: false })
      .limit(20);

    if (activityError) {
      console.error('Error fetching activity log:', activityError);
      return NextResponse.json(
        { error: { message: 'Failed to fetch status history' } },
        { status: 500 }
      );
    }

    // Format history
    const history = (activities || []).map((activity: any) => ({
      id: activity.id,
      timestamp: activity.timestamp,
      user_name: activity.user?.name || 'Unknown',
      new_status: activity.new_value?.status,
      remarks: activity.new_value?.remarks,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching status history:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
