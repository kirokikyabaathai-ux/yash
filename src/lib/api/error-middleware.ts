/**
 * API Error Handling Middleware
 * 
 * Provides middleware functions for consistent error handling in API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  createErrorResponse,
  ErrorCodes,
  logError,
} from '@/lib/errors';
import type { User } from '@/types/api';

/**
 * API Route Handler Type
 */
export type ApiHandler<T = any> = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse<T>>;

/**
 * API Context passed to handlers
 */
export interface ApiContext {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
  params?: Record<string, string>;
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log the error
      await logError(error, {
        action: `${request.method} ${request.nextUrl.pathname}`,
        entityType: 'api_request',
      });

      // Return formatted error response
      return createErrorResponse(error);
    }
  };
}

/**
 * Middleware to require authentication
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return withErrorHandling(async (request: NextRequest, context?: any) => {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new AuthenticationError('Authentication failed', ErrorCodes.UNAUTHORIZED);
    }

    if (!authUser) {
      throw new AuthenticationError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        'Failed to fetch user profile',
        500
      );
    }

    // Check if account is disabled
    if (profile.status === 'disabled') {
      throw new AuthorizationError(
        'Your account has been disabled',
        ErrorCodes.ACCOUNT_DISABLED
      );
    }

    // Create context with user and supabase client
    const apiContext: ApiContext = {
      user: profile,
      supabase,
      params: context?.params,
    };

    return await handler(request, apiContext);
  });
}

/**
 * Middleware to require specific roles
 */
export function withRoles(allowedRoles: string[], handler: ApiHandler): ApiHandler {
  return withAuth(async (request: NextRequest, context: ApiContext) => {
    if (!allowedRoles.includes(context.user.role)) {
      throw new AuthorizationError(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        ErrorCodes.ROLE_MISMATCH
      );
    }

    return await handler(request, context);
  });
}

/**
 * Middleware to require admin role
 */
export function withAdmin(handler: ApiHandler): ApiHandler {
  return withRoles(['admin'], handler);
}

/**
 * Middleware to require office or admin role
 */
export function withOfficeOrAdmin(handler: ApiHandler): ApiHandler {
  return withRoles(['office', 'admin'], handler);
}

/**
 * Handles authentication errors (401)
 */
export function handleAuthenticationError(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return createErrorResponse(error);
  }

  return createErrorResponse(
    new AuthenticationError('Authentication required'),
    401
  );
}

/**
 * Handles authorization errors (403)
 */
export function handleAuthorizationError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    return createErrorResponse(error);
  }

  return createErrorResponse(
    new AuthorizationError('Insufficient permissions'),
    403
  );
}

/**
 * Handles validation errors (400)
 */
export function handleValidationError(errors: Array<{ field: string; message: string }>): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { errors },
        timestamp: new Date().toISOString(),
      },
    },
    { status: 400 }
  );
}

/**
 * Handles not found errors (404)
 */
export function handleNotFoundError(resource: string = 'Resource', id?: string): NextResponse {
  const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
  
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.NOT_FOUND,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 404 }
  );
}

/**
 * Handles conflict errors (409)
 */
export function handleConflictError(message: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.CONFLICT,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 409 }
  );
}

/**
 * Handles business logic errors (422)
 */
export function handleBusinessLogicError(message: string, code: string = ErrorCodes.UNPROCESSABLE_ENTITY): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 422 }
  );
}

/**
 * Handles server errors (500)
 */
export function handleServerError(error: unknown): NextResponse {
  console.error('Server error:', error);
  
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

/**
 * Handles service unavailable errors (503)
 */
export function handleServiceUnavailableError(message: string = 'Service temporarily unavailable'): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 503 }
  );
}

/**
 * Handles gateway timeout errors (504)
 */
export function handleGatewayTimeoutError(message: string = 'Request timed out'): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.GATEWAY_TIMEOUT,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 504 }
  );
}

/**
 * Parses and validates JSON body with error handling
 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new AppError(
      ErrorCodes.INVALID_FORMAT,
      'Invalid JSON in request body',
      400
    );
  }
}

/**
 * Validates request body against a schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const body = await parseJsonBody(request);
  
  try {
    return schema.parse(body);
  } catch (error: any) {
    if (error.errors) {
      const validationErrors = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Validation failed',
        400,
        { errors: validationErrors }
      );
    }
    throw error;
  }
}

/**
 * Extracts and validates query parameters
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  return request.nextUrl.searchParams;
}

/**
 * Gets a required query parameter
 */
export function getRequiredQueryParam(request: NextRequest, param: string): string {
  const value = request.nextUrl.searchParams.get(param);
  
  if (!value) {
    throw new AppError(
      ErrorCodes.MISSING_FIELDS,
      `Required query parameter '${param}' is missing`,
      400
    );
  }
  
  return value;
}

/**
 * Gets an optional query parameter
 */
export function getOptionalQueryParam(request: NextRequest, param: string): string | null {
  return request.nextUrl.searchParams.get(param);
}

/**
 * Validates UUID parameter
 */
export function validateUuidParam(value: string, paramName: string = 'id'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(value)) {
    throw new AppError(
      ErrorCodes.INVALID_FORMAT,
      `Invalid ${paramName}: must be a valid UUID`,
      400
    );
  }
  
  return value;
}
