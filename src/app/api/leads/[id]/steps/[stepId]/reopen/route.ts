/**
 * Reopen Step API Route
 * 
 * POST /api/leads/[id]/steps/[stepId]/reopen - Reopen a completed timeline step
 * 
 * Requirements: 7.1, 7.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const supabase = await createClient();
    const leadId = params.id;
    const leadStepId = params.stepId;

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

    // Check if user has access to this lead and get its status (RLS will handle access)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, status')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: { code: 'LEAD_NOT_FOUND', message: 'Lead not found or access denied' } },
        { status: 404 }
      );
    }

    // Check if lead is closed - only admin can modify closed projects
    if (lead.status === 'closed' && userData.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_CLOSED',
            message: 'This project is closed. Only an admin can modify closed projects.',
          },
        },
        { status: 403 }
      );
    }

    // Get the lead_step with step_master info
    const { data: leadStep, error: leadStepError } = await supabase
      .from('lead_steps')
      .select(`
        id,
        step_id,
        status,
        step_master:step_id (
          allowed_roles
        )
      `)
      .eq('id', leadStepId)
      .eq('lead_id', leadId)
      .single();

    if (leadStepError || !leadStep) {
      return NextResponse.json(
        { error: { code: 'STEP_NOT_FOUND', message: 'Step not found' } },
        { status: 404 }
      );
    }

    // Check if step is completed
    if (leadStep.status !== 'completed') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_STATUS',
            message: 'Only completed steps can be reopened',
          },
        },
        { status: 400 }
      );
    }

    // Parse request body for admin override flag
    const body = await request.json().catch(() => ({}));
    const { admin_override } = body;

    // Check permissions (admin can reopen any step, others need to be in allowed_roles)
    const allowedRoles = (leadStep as any).step_master?.allowed_roles || [];
    const isAdmin = userData.role === 'admin';
    
    if (!isAdmin && !allowedRoles.includes(userData.role)) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You are not authorized to reopen this step',
          },
        },
        { status: 403 }
      );
    }

    // Reopen the step by setting status back to pending and clearing completion data
    const { data: updatedStep, error: updateError } = await supabase
      .from('lead_steps')
      .update({
        status: 'pending',
        completed_by: null,
        completed_at: null,
        remarks: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadStepId)
      .eq('lead_id', leadId)
      .select()
      .single();

    if (updateError) {
      console.error('Error reopening step:', updateError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to reopen step' } },
        { status: 500 }
      );
    }

    // Log activity if admin override
    if (admin_override && isAdmin) {
      await supabase.from('activity_log').insert({
        lead_id: leadId,
        user_id: user.id,
        action: 'admin_override_reopen',
        entity_type: 'lead_step',
        entity_id: leadStepId,
        new_value: {
          status: 'pending',
        },
      });
    }

    return NextResponse.json({ step: updatedStep });
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/steps/[stepId]/reopen:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
