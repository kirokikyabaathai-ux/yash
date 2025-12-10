/**
 * Skip Step API Route
 * 
 * POST /api/leads/[id]/steps/[stepId]/skip - Skip a timeline step (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: leadId, stepId: leadStepId } = await params;

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

    // Get user role - only admin can skip steps
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

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only admins can skip steps' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { remarks } = body;

    // Update the step to skipped status
    const { data: updatedStep, error: updateError } = await supabase
      .from('lead_steps')
      .update({
        status: 'skipped',
        completed_by: user.id,
        completed_at: new Date().toISOString(),
        remarks: remarks || 'Step skipped by admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadStepId)
      .eq('lead_id', leadId)
      .select()
      .single();

    if (updateError) {
      console.error('Error skipping step:', updateError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to skip step' } },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      lead_id: leadId,
      user_id: user.id,
      action: 'skip_step',
      entity_type: 'lead_step',
      entity_id: leadStepId,
      new_value: {
        status: 'skipped',
        remarks: remarks || 'Step skipped by admin',
      },
    });

    // Update next step to pending if it exists
    const { data: allSteps } = await supabase
      .from('lead_steps')
      .select('id, status, step_master:step_id(order_index)')
      .eq('lead_id', leadId)
      .order('step_master(order_index)', { ascending: true });

    if (allSteps) {
      const currentStepData = await supabase
        .from('lead_steps')
        .select('step_master:step_id(order_index)')
        .eq('id', leadStepId)
        .single();

      if (currentStepData.data) {
        const currentOrderIndex = (currentStepData.data.step_master as any).order_index;
        const nextStep = allSteps.find((s) => {
          const stepOrderIndex = (s.step_master as any).order_index;
          return stepOrderIndex === currentOrderIndex + 1 && s.status === 'upcoming';
        });

        if (nextStep) {
          await supabase
            .from('lead_steps')
            .update({ status: 'pending', updated_at: new Date().toISOString() })
            .eq('id', nextStep.id);
        }
      }
    }

    return NextResponse.json({ 
      data: updatedStep,
      message: 'Step skipped successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/steps/[stepId]/skip:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
