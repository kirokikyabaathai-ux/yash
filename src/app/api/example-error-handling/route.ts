/**
 * Example API Route with Comprehensive Error Handling
 * 
 * This file demonstrates how to use the error handling utilities
 * in API routes. It shows examples of:
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Validation errors (400)
 * - Not found errors (404)
 * - Conflict errors (409)
 * - Business logic errors (422)
 * - Server errors (500)
 * 
 * This file is for reference and can be deleted in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  ErrorCodes,
} from '@/lib/errors';

/**
 * Example: Public endpoint (no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    // This endpoint doesn't require authentication
    return NextResponse.json({ message: 'Public endpoint' });
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Example: Authenticated endpoint
 * Requires user to be logged in
 * 
 * Note: This is a simplified example. In production, use the withAuth middleware
 * from @/lib/api/error-middleware
 */
export async function POST(request: NextRequest) {
  try {
    // Example: Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new AuthenticationError('User not authenticated');
    }

    // Example: Validate request body
    const body = await request.json();
    // In production, use: await validateRequestBody(request, createLeadSchema);

    // Example: Check business logic
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', body.phone)
      .single();

    if (existingLead) {
      // Example: Throw conflict error
      throw new ConflictError(
        'A lead with this phone number already exists',
        ErrorCodes.DUPLICATE_ENTRY
      );
    }

    // Example: Create resource
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...body,
        created_by: user.id,
        status: 'ongoing',
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create lead');
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Example error scenarios:
 * 
 * 1. Authentication Error (401):
 *    - User not logged in
 *    - Invalid or expired token
 *    - Missing authentication header
 * 
 * 2. Authorization Error (403):
 *    - User doesn't have required role
 *    - Account is disabled
 *    - RLS policy violation
 * 
 * 3. Validation Error (400):
 *    - Missing required fields
 *    - Invalid data format
 *    - Invalid file type
 * 
 * 4. Not Found Error (404):
 *    - Resource doesn't exist
 *    - File not found
 * 
 * 5. Conflict Error (409):
 *    - Duplicate entry
 *    - Resource already exists
 *    - Step already completed
 * 
 * 6. Business Logic Error (422):
 *    - Prerequisites not met
 *    - Invalid status transition
 *    - Mandatory documents missing
 * 
 * 7. Server Error (500):
 *    - Database connection failure
 *    - Unexpected error
 *    - Transaction rollback
 */
