/**
 * Individual Lead API Routes - GET, PATCH, DELETE
 * 
 * Handles operations on a specific lead.
 * RLS policies automatically enforce access control based on user role.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import { getLead, updateLead, deleteLead } from '@/lib/api/leads';
import type { UpdateLeadRequest } from '@/types/api';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/leads/[id]
 * 
 * Gets a single lead by ID.
 * RLS policies automatically filter based on user role.
 * Returns 404 if lead doesn't exist or user doesn't have access.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get lead (RLS policies will filter based on user role)
    const lead = await getLead(id, true);

    if (!lead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch lead',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]
 * 
 * Updates a lead.
 * RLS policies automatically enforce update permissions based on user role.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if lead exists and user has access
    const existingLead = await getLead(id, true);

    if (!existingLead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body: UpdateLeadRequest = await request.json();

    // Validate fields if provided
    const errors: Array<{ field: string; message: string }> = [];

    if (body.customer_name !== undefined && !body.customer_name.trim()) {
      errors.push({ field: 'customer_name', message: 'Customer name cannot be empty' });
    }

    if (body.phone !== undefined && !body.phone.trim()) {
      errors.push({ field: 'phone', message: 'Phone number cannot be empty' });
    }

    if (body.address !== undefined && !body.address.trim()) {
      errors.push({ field: 'address', message: 'Address cannot be empty' });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { errors },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Update lead
    const updatedLead = await updateLead(id, body, true);

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update lead',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * 
 * Deletes a lead.
 * RLS policies automatically enforce delete permissions based on user role.
 * Cascading deletes will remove associated documents, timeline steps, etc.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication using NextAuth
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if lead exists and user has access
    const existingLead = await getLead(id, true);

    if (!existingLead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Delete lead
    await deleteLead(id, true);

    return NextResponse.json(
      {
        message: 'Lead deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete lead',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
