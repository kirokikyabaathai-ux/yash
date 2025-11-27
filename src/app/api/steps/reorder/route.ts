/**
 * Step Master Reorder API Route
 * 
 * PUT /api/steps/reorder - Reorder steps
 * 
 * Requirements: 6.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
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
    const { steps } = body;

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request: steps array required',
          },
        },
        { status: 400 }
      );
    }

    // Validate each step has id
    for (const step of steps) {
      if (!step.id) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Each step must have id',
            },
          },
          { status: 400 }
        );
      }
    }

    // Update order_index using fractional ordering
    // Assign order values with gaps (1000, 2000, 3000, etc.)
    const updatePromises = steps.map((step, index) => {
      const newOrderIndex = (index + 1) * 1000;
      const updateData: any = {
        order_index: newOrderIndex,
        updated_at: new Date().toISOString(),
      };
      
      return supabase
        .from('step_master')
        .update(updateData)
        .eq('id', step.id);
    });

    const results = await Promise.all(updatePromises);
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error('Error reordering steps:', errors);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to reorder steps' } },
        { status: 500 }
      );
    }

    // Fetch updated steps
    const { data: updatedSteps, error: fetchError } = await supabase
      .from('step_master')
      .select('*')
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated steps:', fetchError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch updated steps' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ steps: updatedSteps });
  } catch (error) {
    console.error('Error in PUT /api/steps/reorder:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
