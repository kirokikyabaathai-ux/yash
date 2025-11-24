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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Check if user is admin
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

    // Only admin can access step master (but all users can read for timeline display)
    // For GET, we allow all authenticated users to read
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
    const supabase = await createClient();

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

    // Check if user is admin
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
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

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
    if (!step_name || !order_index || !allowed_roles || !Array.isArray(allowed_roles)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: step_name, order_index, allowed_roles',
          },
        },
        { status: 400 }
      );
    }

    // Create step
    const { data: newStep, error: createError } = await supabase
      .from('step_master')
      .insert({
        step_name,
        order_index,
        allowed_roles,
        remarks_required: remarks_required ?? false,
        attachments_allowed: attachments_allowed ?? false,
        customer_upload: customer_upload ?? false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating step:', createError);
      
      // Check for unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_ORDER_INDEX',
              message: 'A step with this order index already exists',
            },
          },
          { status: 409 }
        );
      }

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
