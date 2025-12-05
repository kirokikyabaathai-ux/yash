/**
 * Leads API Routes - GET (list) and POST (create)
 * 
 * Handles listing leads with filters and creating new leads.
 * RLS policies automatically filter results based on user role.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import { getLeads, createLead } from '@/lib/api/leads';
import type { CreateLeadRequest, LeadFilters } from '@/types/api';

/**
 * GET /api/leads
 * 
 * Lists leads with optional filtering and pagination.
 * Results are automatically filtered by RLS policies based on user role:
 * - Admin/Office: See all leads
 * - Agent: See only their own leads
 * - Customer: See only their linked lead
 * - Installer: See only assigned leads
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication with NextAuth
    const session = await auth();

    if (!session || !session.user) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: LeadFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status')?.split(',') as any,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      currentStep: searchParams.get('currentStep') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Get leads (RLS policies will filter based on user role)
    const result = await getLeads(filters, true);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch leads',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * 
 * Creates a new lead.
 * The created_by field is automatically set to the authenticated user.
 * Initial status is set to "ongoing" as per Requirement 2.2.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication with NextAuth
    const session = await auth();

    if (!session || !session.user) {
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

    // Parse request body
    const body: CreateLeadRequest = await request.json();

    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!body.customer_name?.trim()) {
      errors.push({ field: 'customer_name', message: 'Customer name is required' });
    }

    if (!body.phone?.trim()) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    }

    if (!body.address?.trim()) {
      errors.push({ field: 'address', message: 'Address is required' });
    }

    if (!body.source) {
      errors.push({ field: 'source', message: 'Source is required' });
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

    // Create lead
    const lead = await createLead(body, session.user.id, true);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create lead',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
