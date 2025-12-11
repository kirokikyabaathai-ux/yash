/**
 * API Route: Update Lead Status
 * PATCH /api/leads/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
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
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { id: leadId } = await params;

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'office', 'agent'].includes(userData.role)) {
      return NextResponse.json(
        { error: { message: 'Only admin, office team, and agents can update status' } },
        { status: 403 }
      );
    }

    // If user is an agent, verify they own the lead
    if (userData.role === 'agent') {
      const { data: leadOwnership } = await supabase
        .from('leads')
        .select('created_by')
        .eq('id', leadId)
        .single();

      if (!leadOwnership || leadOwnership.created_by !== user.id) {
        return NextResponse.json(
          { error: { message: 'Agents can only update status of their own leads' } },
          { status: 403 }
        );
      }
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
