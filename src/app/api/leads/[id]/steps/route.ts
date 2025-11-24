/**
 * Lead Steps API Route
 * 
 * GET /api/leads/[id]/steps - Get timeline steps for a lead
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const leadId = params.id;

    // Check authentication
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

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Check if user has access to this lead (RLS will handle this)
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

    // Fetch lead steps with step master details and completed_by user info
    const { data: leadSteps, error: stepsError } = await supabase
      .from('lead_steps')
      .select(`
        id,
        lead_id,
        step_id,
        status,
        completed_by,
        completed_at,
        remarks,
        attachments,
        created_at,
        updated_at,
        step_master:step_id (
          id,
          step_name,
          order_index,
          allowed_roles,
          remarks_required,
          attachments_allowed,
          customer_upload
        )
      `)
      .eq('lead_id', leadId)
      .order('step_master(order_index)', { ascending: true });

    if (stepsError) {
      console.error('Error fetching lead steps:', stepsError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch timeline steps' } },
        { status: 500 }
      );
    }

    // Fetch completed_by user names
    const completedByIds = leadSteps
      ?.filter((step: any) => step.completed_by)
      .map((step: any) => step.completed_by) || [];

    let completedByUsers: Record<string, string> = {};
    if (completedByIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', completedByIds);

      if (!usersError && users) {
        completedByUsers = users.reduce((acc: Record<string, string>, user: any) => {
          acc[user.id] = user.name;
          return acc;
        }, {});
      }
    }

    // Transform the data to flatten step_master fields
    const transformedSteps = leadSteps?.map((step: any) => ({
      id: step.id,
      lead_id: step.lead_id,
      step_id: step.step_id,
      step_name: step.step_master?.step_name || 'Unknown Step',
      order_index: step.step_master?.order_index || 0,
      status: step.status,
      completed_by: step.completed_by,
      completed_by_name: step.completed_by ? completedByUsers[step.completed_by] || null : null,
      completed_at: step.completed_at,
      remarks: step.remarks,
      attachments: step.attachments,
      allowed_roles: step.step_master?.allowed_roles || [],
      remarks_required: step.step_master?.remarks_required || false,
      attachments_allowed: step.step_master?.attachments_allowed || false,
      customer_upload: step.step_master?.customer_upload || false,
      created_at: step.created_at,
      updated_at: step.updated_at,
    })) || [];

    return NextResponse.json({ steps: transformedSteps });
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/steps:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
