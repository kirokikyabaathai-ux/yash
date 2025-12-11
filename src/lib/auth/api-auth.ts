/**
 * API Route Authentication Utilities
 * Helper functions for authenticating API routes
 */

import { NextResponse } from 'next/server';
import { auth } from './auth';

/**
 * Require authentication in API routes
 * Returns user and error response if not authenticated
 * 
 * @returns Object with user and response (response is null if authenticated)
 * 
 * @example
 * const { user, response } = await requireAuth();
 * if (!user) return response;
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      ),
    };
  }

  return {
    user: session.user,
    response: null,
  };
}
