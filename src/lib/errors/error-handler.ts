/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling, formatting, and logging
 * across the Solar CRM application.
 */

import { NextResponse } from 'next/server';
import type { ErrorResponse, ValidationError } from '@/types/api';

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // Authentication Errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  MISSING_AUTH_TOKEN: 'MISSING_AUTH_TOKEN',
  
  // Authorization Errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RLS_POLICY_VIOLATION: 'RLS_POLICY_VIOLATION',
  ROLE_MISMATCH: 'ROLE_MISMATCH',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // Business Logic Errors (422)
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  MANDATORY_DOCUMENTS_MISSING: 'MANDATORY_DOCUMENTS_MISSING',
  STEP_PREREQUISITES_NOT_MET: 'STEP_PREREQUISITES_NOT_MET',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // Conflict Errors (409)
  CONFLICT: 'CONFLICT',
  LEAD_ALREADY_LINKED: 'LEAD_ALREADY_LINKED',
  STEP_ALREADY_COMPLETED: 'STEP_ALREADY_COMPLETED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  SIGNED_URL_EXPIRED: 'SIGNED_URL_EXPIRED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  
  // Database Errors (500, 503, 504)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_FAILURE: 'CONNECTION_FAILURE',
  QUERY_TIMEOUT: 'QUERY_TIMEOUT',
  TRANSACTION_ROLLBACK: 'TRANSACTION_ROLLBACK',
  
  // Service Errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================================================
// Error Classes
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code: ErrorCode = ErrorCodes.UNAUTHORIZED) {
    super(code, message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code: ErrorCode = ErrorCodes.FORBIDDEN) {
    super(code, message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(ErrorCodes.VALIDATION_ERROR, message, 400, { errors });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(ErrorCodes.NOT_FOUND, message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCodes.CONFLICT) {
    super(code, message, 409);
    this.name = 'ConflictError';
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCodes.UNPROCESSABLE_ENTITY) {
    super(code, message, 422);
    this.name = 'BusinessLogicError';
  }
}

// ============================================================================
// Error Response Formatter
// ============================================================================

/**
 * Formats an error into a consistent ErrorResponse structure
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString();

  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp,
      },
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: error.message,
        timestamp,
      },
    };
  }

  // Handle unknown errors
  return {
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      timestamp,
    },
  };
}

/**
 * Creates a NextResponse with formatted error
 */
export function createErrorResponse(error: unknown, defaultStatusCode: number = 500): NextResponse {
  const errorResponse = formatErrorResponse(error);
  const statusCode = error instanceof AppError ? error.statusCode : defaultStatusCode;
  
  return NextResponse.json(errorResponse, { status: statusCode });
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Maps error codes to user-friendly messages
 */
export const UserFriendlyMessages: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCodes.UNAUTHORIZED]: 'Please log in to continue',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [ErrorCodes.MISSING_AUTH_TOKEN]: 'Authentication required',
  
  // Authorization
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions',
  [ErrorCodes.RLS_POLICY_VIOLATION]: 'Access to this data is restricted',
  [ErrorCodes.ROLE_MISMATCH]: 'Your role does not allow this action',
  [ErrorCodes.ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support',
  
  // Validation
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCodes.MISSING_FIELDS]: 'Required fields are missing',
  [ErrorCodes.INVALID_FORMAT]: 'Invalid data format',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file format',
  
  // Business Logic
  [ErrorCodes.UNPROCESSABLE_ENTITY]: 'Unable to process your request',
  [ErrorCodes.MANDATORY_DOCUMENTS_MISSING]: 'All mandatory documents must be uploaded',
  [ErrorCodes.STEP_PREREQUISITES_NOT_MET]: 'Prerequisites for this step have not been met',
  [ErrorCodes.INVALID_STATUS_TRANSITION]: 'Invalid status transition',
  
  // Conflicts
  [ErrorCodes.CONFLICT]: 'A conflict occurred with existing data',
  [ErrorCodes.LEAD_ALREADY_LINKED]: 'This lead is already linked to another account',
  [ErrorCodes.STEP_ALREADY_COMPLETED]: 'This step has already been completed',
  [ErrorCodes.DUPLICATE_ENTRY]: 'This entry already exists',
  
  // Not Found
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ErrorCodes.FILE_NOT_FOUND]: 'File not found',
  
  // File Upload
  [ErrorCodes.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [ErrorCodes.UPLOAD_FAILED]: 'File upload failed. Please try again',
  [ErrorCodes.SIGNED_URL_EXPIRED]: 'Upload link has expired. Please request a new one',
  [ErrorCodes.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded',
  
  // Database
  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again',
  [ErrorCodes.DATABASE_ERROR]: 'Database error occurred. Please try again',
  [ErrorCodes.CONNECTION_FAILURE]: 'Unable to connect to the database. Please try again',
  [ErrorCodes.QUERY_TIMEOUT]: 'Request timed out. Please try again',
  [ErrorCodes.TRANSACTION_ROLLBACK]: 'Transaction failed. Please try again',
  
  // Service
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later',
  [ErrorCodes.GATEWAY_TIMEOUT]: 'Request timed out. Please try again',
};

/**
 * Gets a user-friendly error message for an error code
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  return UserFriendlyMessages[code] || UserFriendlyMessages[ErrorCodes.INTERNAL_ERROR];
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Logs an error with context information
 * In production, this would integrate with activity_log table
 */
export async function logError(
  error: unknown,
  context?: {
    userId?: string;
    leadId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
  }
): Promise<void> {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error instanceof AppError ? error.code : undefined,
    } : error,
    context,
  };

  // Log to console (in production, this would go to activity_log)
  console.error('Application Error:', JSON.stringify(errorInfo, null, 2));

  // TODO: In production, insert into activity_log table
  // if (context?.userId) {
  //   await supabase.from('activity_log').insert({
  //     user_id: context.userId,
  //     lead_id: context.leadId,
  //     action: 'ERROR',
  //     entity_type: context.entityType || 'system',
  //     entity_id: context.entityId,
  //     new_value: errorInfo,
  //     timestamp: new Date().toISOString(),
  //   });
  // }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates required fields and returns validation errors
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: Array<{ field: string; label: string }>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const { field, label } of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      errors.push({
        field,
        message: `${label} is required`,
      });
    }
  }

  return errors;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic validation)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates file size
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}

/**
 * Validates file type
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

// ============================================================================
// HTTP Status Code Helpers
// ============================================================================

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  INSUFFICIENT_STORAGE: 507,
} as const;

/**
 * Checks if a status code indicates success
 */
export function isSuccessStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Checks if a status code indicates a client error
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Checks if a status code indicates a server error
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}
