/**
 * Admin Move Timeline Backward API Route
 * 
 * Allows admin to reopen a step and all subsequent steps.
 * 
 * Requirements: 11.1, 11.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { id: leadId } = await params;

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { step_id, remarks } = body;

    if (!step_id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'step_id is required' } },
        { status: 400 }
      );
    }

    // Get the target step to find its order_index
    const { data: targetLeadStep, error: targetError } = await supabase
      .from('lead_steps')
      .select('*, step_master:step_id(order_index)')
      .eq('id', step_id)
      .eq('lead_id', leadId)
      .single();

    if (targetError || !targetLeadStep) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Step not found' } },
        { status: 404 }
      );
    }

    const targetOrderIndex = (targetLeadStep.step_master as any).order_index;

    // Get all steps for this lead with their order_index
    const { data: allSteps, error: stepsError } = await supabase
      .from('lead_steps')
      .select('*, step_master:step_id(order_index)')
      .eq('lead_id', leadId)
      .order('step_master(order_index)', { ascending: true });

    if (stepsError || !allSteps) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch steps' } },
        { status: 500 }
      );
    }

    // Reopen the target step and all subsequent steps
    const stepsToReopen = allSteps.filter((step) => {
      const stepOrderIndex = (step.step_master as any).order_index;
      return stepOrderIndex >= targetOrderIndex;
    });

    // Update all steps to pending (or upcoming for steps after the target)
    for (const step of stepsToReopen) {
      const stepOrderIndex = (step.step_master as any).order_index;
      const newStatus = stepOrderIndex === targetOrderIndex ? 'pending' : 'upcoming';

      const { error: updateError } = await supabase
        .from('lead_steps')
        .update({
          status: newStatus,
          completed_by: null,
          completed_at: null,
          remarks: stepOrderIndex === targetOrderIndex 
            ? (remarks || 'Admin override - moved timeline backward')
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', step.id);

      if (updateError) {
        console.error('Error updating step:', updateError);
      }

      // Log activity
      await supabase.from('activity_log').insert({
        lead_id: leadId,
        user_id: user.id,
        action: 'admin_override_reopen',
        entity_type: 'lead_step',
        entity_id: step.id,
        new_value: {
          status: newStatus,
          remarks: stepOrderIndex === targetOrderIndex 
            ? (remarks || 'Admin override - moved timeline backward')
            : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Moved timeline backward, reopened ${stepsToReopen.length} step(s)`,
      reopened_steps: stepsToReopen.length,
    });
  } catch (error) {
    console.error('Admin move backward error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
