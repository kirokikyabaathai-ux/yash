/**
 * Dashboard Metrics API Route
 * 
 * Calculates and returns dashboard metrics filtered by user role.
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User profile not found' } },
        { status: 404 }
      );
    }

    // Get all leads (RLS will filter based on role)
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*');

    if (leadsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: leadsError.message } },
        { status: 500 }
      );
    }

    // Calculate total leads
    const totalLeads = leads?.length || 0;

    // Calculate leads by status
    const leadsByStatus = {
      ongoing: 0,
      interested: 0,
      not_interested: 0,
      closed: 0,
    };

    leads?.forEach((lead) => {
      leadsByStatus[lead.status]++;
    });

    // Get all lead steps for current timeline step calculation
    const { data: leadSteps, error: stepsError } = await supabase
      .from('lead_steps')
      .select(`
        *,
        step_master:step_id (
          id,
          step_name,
          order_index
        )
      `)
      .in('lead_id', leads?.map(l => l.id) || [])
      .eq('status', 'pending')
      .order('step_master(order_index)', { ascending: true });

    if (stepsError) {
      console.error('Error fetching lead steps:', stepsError);
    }

    // Calculate leads by current step
    const leadsByStep: Record<string, number> = {};
    const leadCurrentSteps = new Map<string, string>();

    leadSteps?.forEach((step: any) => {
      if (!leadCurrentSteps.has(step.lead_id)) {
        const stepName = step.step_master?.step_name || 'Unknown';
        leadCurrentSteps.set(step.lead_id, stepName);
        leadsByStep[stepName] = (leadsByStep[stepName] || 0) + 1;
      }
    });

    // Calculate conversion rates
    const ongoingCount = leadsByStatus.ongoing;
    const interestedCount = leadsByStatus.interested;
    const closedCount = leadsByStatus.closed;
    const totalForConversion = ongoingCount + interestedCount + closedCount;

    const conversionRate = {
      ongoingToInterested: totalForConversion > 0 
        ? ((interestedCount + closedCount) / totalForConversion) * 100 
        : 0,
      interestedToClosed: (interestedCount + closedCount) > 0 
        ? (closedCount / (interestedCount + closedCount)) * 100 
        : 0,
      overallConversion: totalForConversion > 0 
        ? (closedCount / totalForConversion) * 100 
        : 0,
    };

    // Calculate pending actions count
    let pendingActionsCount = 0;

    // Count incomplete steps (pending status)
    const { count: pendingStepsCount } = await supabase
      .from('lead_steps')
      .select('*', { count: 'exact', head: true })
      .in('lead_id', leads?.map(l => l.id) || [])
      .eq('status', 'pending');

    pendingActionsCount += pendingStepsCount || 0;

    // Count missing mandatory documents
    const mandatoryDocTypes = [
      'aadhar_front',
      'aadhar_back',
      'bijli_bill',
      'bank_passbook',
      'cancelled_cheque',
      'pan_card',
    ];

    for (const lead of leads || []) {
      const { data: docs } = await supabase
        .from('documents')
        .select('document_category')
        .eq('lead_id', lead.id)
        .eq('type', 'mandatory')
        .eq('status', 'valid');

      const uploadedCategories = new Set(docs?.map(d => d.document_category) || []);
      const missingDocs = mandatoryDocTypes.filter(cat => !uploadedCategories.has(cat));
      
      if (missingDocs.length > 0) {
        pendingActionsCount += missingDocs.length;
      }
    }

    // Get recent activity (last 10 activities)
    const { data: recentActivity, error: activityError } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:user_id (
          id,
          name
        ),
        lead:lead_id (
          id,
          customer_name
        )
      `)
      .in('lead_id', leads?.map(l => l.id) || [])
      .order('timestamp', { ascending: false })
      .limit(10);

    if (activityError) {
      console.error('Error fetching activity log:', activityError);
    }

    // Return metrics
    return NextResponse.json({
      totalLeads,
      leadsByStatus,
      leadsByStep,
      conversionRate,
      pendingActions: pendingActionsCount,
      recentActivity: recentActivity || [],
      userRole: profile.role,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to calculate dashboard metrics',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    );
  }
}
