/**
 * Complete Step API Route
 * 
 * POST /api/leads/[id]/steps/[stepId]/complete - Complete a timeline step
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
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

    // Check if lead is completed - only admin can modify completed projects
    if (lead.status === 'lead_completed' && userData.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_CLOSED',
            message: 'This project is completed. Only an admin can modify completed projects.',
          },
        },
        { status: 403 }
      );
    }

    // Get the lead_step to find the step_id and required documents
    const { data: leadStep, error: leadStepError } = await supabase
      .from('lead_steps')
      .select(`
        step_id,
        status,
        step_master:step_id (
          step_documents (
            id,
            document_category,
            submission_type
          )
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

    // Parse request body
    const body = await request.json();
    const { remarks, attachments, admin_override, skipped } = body;

    // Check if all required documents are submitted (unless admin override)
    const stepDocuments = (leadStep.step_master as any)?.step_documents || [];
    if (stepDocuments.length > 0 && !admin_override) {
      const requiredCategories = stepDocuments.map((doc: any) => doc.document_category);
      
      // Get submitted documents for this lead
      const { data: submittedDocs, error: docsError } = await supabase
        .from('documents')
        .select('document_category, is_submitted, status')
        .eq('lead_id', leadId)
        .in('document_category', requiredCategories)
        .eq('is_submitted', true)
        .eq('status', 'valid') as any;

      if (docsError) {
        console.error('Error checking documents:', docsError);
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to verify documents' } },
          { status: 500 }
        );
      }

      const submittedCategories = (submittedDocs as any[])?.map((doc: any) => doc.document_category) || [];
      const missingDocuments = requiredCategories.filter(
        (cat: string) => !submittedCategories.includes(cat)
      );

      if (missingDocuments.length > 0) {
        const missingDocNames = missingDocuments.map((cat: string) => 
          cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ).join(', ');

        return NextResponse.json(
          {
            error: {
              code: 'MISSING_DOCUMENTS',
              message: `Cannot complete step. Missing required documents: ${missingDocNames}`,
              missing_documents: missingDocuments,
            },
          },
          { status: 400 }
        );
      }
    }

    // If admin override is requested, bypass RPC and update directly
    if (admin_override && userData.role === 'admin') {
      const { data: updatedStep, error: updateError } = await supabase
        .from('lead_steps')
        .update({
          status: 'completed',
          completed_by: user.id,
          completed_at: new Date().toISOString(),
          remarks: remarks || (skipped ? 'Admin override - step skipped' : 'Admin override completion'),
          attachments: attachments || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadStepId)
        .eq('lead_id', leadId)
        .select()
        .single();

      if (updateError) {
        console.error('Error in admin override:', updateError);
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Failed to complete step' } },
          { status: 500 }
        );
      }

      // Log activity
      await supabase.from('activity_log').insert({
        lead_id: leadId,
        user_id: user.id,
        action: skipped ? 'admin_override_skip' : 'admin_override_complete',
        entity_type: 'lead_step',
        entity_id: leadStepId,
        new_value: {
          status: 'completed',
          remarks: remarks || (skipped ? 'Admin override - step skipped' : 'Admin override completion'),
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

      return NextResponse.json({ result: updatedStep });
    }

    // Call the complete_step RPC function
    const { data: result, error: rpcError } = await supabase.rpc('complete_step', {
      p_lead_id: leadId,
      p_step_id: leadStep.step_id,
      p_user_id: user.id,
      p_remarks: remarks || null,
      p_attachments: attachments || null,
    });

    if (rpcError) {
      console.error('Error calling complete_step RPC:', rpcError);

      // Handle specific error messages
      if (rpcError.message.includes('not authorized')) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You are not authorized to complete this step',
            },
          },
          { status: 403 }
        );
      }

      if (rpcError.message.includes('already completed')) {
        return NextResponse.json(
          {
            error: {
              code: 'ALREADY_COMPLETED',
              message: 'This step is already completed',
            },
          },
          { status: 409 }
        );
      }

      if (rpcError.message.includes('Remarks are required')) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Remarks are required for this step',
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: rpcError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/steps/[stepId]/complete:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
