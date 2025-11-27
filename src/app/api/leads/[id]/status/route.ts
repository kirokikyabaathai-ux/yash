/**
 * API Route: Update Lead Status
 * PATCH /api/leads/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum([
    'lead',
    'lead_interested',
    'lead_processing',
    'lead_completed',
    'lead_cancelled',
  ]),
  remarks: z.string().optional(),
});

export async function PATCH(
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

    if (!userData || !['admin', 'office'].includes(userData.role)) {
      return NextResponse.json(
        { error: { message: 'Only admin and office team can update status' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request data', details: validation.error } },
        { status: 400 }
      );
    }

    const { status, remarks } = validation.data;

    // Get current lead status
    const { data: currentLead } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (!currentLead) {
      return NextResponse.json(
        { error: { message: 'Lead not found' } },
        { status: 404 }
      );
    }

    // Validate status transition based on business rules
    const allowedTransitions: Record<string, string[]> = {
      lead: ['lead_interested', 'lead_cancelled'],
      lead_interested: ['lead_cancelled'], // lead_processing is automatic
      lead_processing: ['lead_completed', 'lead_cancelled'],
      lead_completed: [],
      lead_cancelled: [],
    };

    const allowed = allowedTransitions[currentLead.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { 
          error: { 
            message: `Invalid status transition from ${currentLead.status} to ${status}. ${
              currentLead.status === 'lead_interested' && status === 'lead_processing' 
                ? 'Status will automatically change to lead_processing when customer profile form is submitted.' 
                : ''
            }` 
          } 
        },
        { status: 400 }
      );
    }

    // Update lead status
    const { data: lead, error: updateError } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: { message: 'Failed to update status', details: updateError } },
        { status: 500 }
      );
    }

    // Log activity
    if (remarks) {
      await supabase.from('activity_log').insert({
        lead_id: leadId,
        user_id: user.id,
        action: 'status_change',
        entity_type: 'lead',
        entity_id: leadId,
        new_value: { status, remarks },
      });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
