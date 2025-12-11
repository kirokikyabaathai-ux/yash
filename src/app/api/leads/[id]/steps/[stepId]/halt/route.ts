/**
 * Halt Step API Route
 * 
 * POST /api/leads/[id]/steps/[stepId]/halt - Halt a timeline step (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
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
    const { id: leadId, stepId: leadStepId } = await params;

    // Get user role - only admin can halt steps
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
        { error: { code: 'FORBIDDEN', message: 'Only admins can halt steps' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { remarks } = body;

    // Update the step to halted status
    const { data: updatedStep, error: updateError } = await supabase
      .from('lead_steps')
      .update({
        status: 'halted',
        completed_by: user.id,
        completed_at: new Date().toISOString(),
        remarks: remarks || 'Step halted by admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadStepId)
      .eq('lead_id', leadId)
      .select()
      .single();

    if (updateError) {
      console.error('Error halting step:', updateError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to halt step' } },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      lead_id: leadId,
      user_id: user.id,
      action: 'halt_step',
      entity_type: 'lead_step',
      entity_id: leadStepId,
      new_value: {
        status: 'halted',
        remarks: remarks || 'Step halted by admin',
      },
    });

    return NextResponse.json({ 
      data: updatedStep,
      message: 'Step halted successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/steps/[stepId]/halt:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
