/**
 * Step Master API Routes
 * 
 * GET /api/steps - List all steps
 * POST /api/steps - Create new step
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!session || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user account is disabled
    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Account disabled' } },
        { status: 403 }
      );
    }
    
    // Use regular client - RLS policies allow all authenticated users to read step_master
    const supabase = await createClient();

    // All authenticated users can read step_master for timeline display
    const { data: steps, error: stepsError } = await supabase
      .from('step_master')
      .select('*')
      .order('order_index', { ascending: true });

    if (stepsError) {
      console.error('Error fetching steps:', stepsError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch steps' } },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Error in GET /api/steps:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!session || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if user account is disabled
    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Account disabled' } },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }
    
    // Use regular client - RLS policies handle admin-only write access
    const supabase = await createClient();

    // Parse request body
    const body = await request.json();
    const {
      step_name,
      order_index,
      allowed_roles,
      remarks_required,
      attachments_allowed,
      customer_upload,
    } = body;

    // Validate required fields
    if (!step_name || !allowed_roles || !Array.isArray(allowed_roles)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: step_name, allowed_roles',
          },
        },
        { status: 400 }
      );
    }

    // Get the maximum order_index to append at the end
    const { data: maxStep } = await supabase
      .from('step_master')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const newOrderIndex = maxStep ? Number(maxStep.order_index) + 1000 : 1000;

    // Create new step
    const insertData: any = {
      step_name,
      order_index: newOrderIndex,
      allowed_roles,
      remarks_required: remarks_required ?? false,
      attachments_allowed: attachments_allowed ?? false,
      customer_upload: customer_upload ?? false,
    };

    const { data: newStep, error: createError } = await supabase
      .from('step_master')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating step:', createError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create step' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ step: newStep }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/steps:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
