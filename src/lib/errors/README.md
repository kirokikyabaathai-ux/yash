# Error Handling System

This directory contains the error handling utilities for the YAS Natural application.

## Overview

The error handling system provides:
- Consistent error response format across all API routes
- Type-safe error classes for different error scenarios
- User-friendly error messages
- Error logging capabilities
- Validation helpers

## Error Classes

### AppError
Base error class for all application errors.

```typescript
throw new AppError(
  ErrorCodes.INTERNAL_ERROR,
  'Something went wrong',
  500,
  { additionalInfo: 'details' }
);
```

### AuthenticationError (401)
For authentication failures.

```typescript
throw new AuthenticationError('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS);
```

### AuthorizationError (403)
For permission/authorization failures.

```typescript
throw new AuthorizationError('Insufficient permissions', ErrorCodes.INSUFFICIENT_PERMISSIONS);
```

### ValidationError (400)
For validation failures.

```typescript
throw new ValidationError('Validation failed', [
  { field: 'email', message: 'Invalid email format' },
  { field: 'phone', message: 'Phone number is required' }
]);
```

### NotFoundError (404)
For resource not found errors.

```typescript
throw new NotFoundError('Lead', leadId);
```

### ConflictError (409)
For conflict errors (duplicates, etc).

```typescript
throw new ConflictError('Lead already exists', ErrorCodes.DUPLICATE_ENTRY);
```

### BusinessLogicError (422)
For business logic violations.

```typescript
throw new BusinessLogicError(
  'Cannot complete step without attachments',
  ErrorCodes.STEP_PREREQUISITES_NOT_MET
);
```

## Error Response Format

All errors follow this consistent format:

```typescript
{
  error: {
    code: string;        // Error code (e.g., 'VALIDATION_ERROR')
    message: string;     // Error message
    details?: object;    // Optional additional details
    timestamp: string;   // ISO timestamp
  }
}
```

## Error Codes

Common error codes include:

**Authentication (401):**
- `UNAUTHORIZED`
- `INVALID_CREDENTIALS`
- `SESSION_EXPIRED`
- `MISSING_AUTH_TOKEN`

**Authorization (403):**
- `FORBIDDEN`
- `INSUFFICIENT_PERMISSIONS`
- `RLS_POLICY_VIOLATION`
- `ROLE_MISMATCH`
- `ACCOUNT_DISABLED`

**Validation (400):**
- `VALIDATION_ERROR`
- `MISSING_FIELDS`
- `INVALID_FORMAT`
- `INVALID_FILE_TYPE`

**Business Logic (422):**
- `UNPROCESSABLE_ENTITY`
- `MANDATORY_DOCUMENTS_MISSING`
- `STEP_PREREQUISITES_NOT_MET`
- `INVALID_STATUS_TRANSITION`

**Conflicts (409):**
- `CONFLICT`
- `LEAD_ALREADY_LINKED`
- `STEP_ALREADY_COMPLETED`
- `DUPLICATE_ENTRY`

**Not Found (404):**
- `NOT_FOUND`
- `RESOURCE_NOT_FOUND`
- `FILE_NOT_FOUND`

**Server Errors (500+):**
- `INTERNAL_ERROR`
- `DATABASE_ERROR`
- `CONNECTION_FAILURE`
- `SERVICE_UNAVAILABLE`

## Usage in API Routes

### Basic Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### With Authentication Middleware

```typescript
import { withAuth, ApiContext } from '@/lib/api/error-middleware';

export const GET = withAuth(async (request: NextRequest, context: ApiContext) => {
  // context.user is available here
  // Errors are automatically handled
  return NextResponse.json({ user: context.user });
});
```

### With Role-Based Access

```typescript
import { withRoles } from '@/lib/api/error-middleware';

export const POST = withRoles(
  ['admin', 'office'],
  async (request, context) => {
    // Only admin and office users can access
    return NextResponse.json({ message: 'Success' });
  }
);
```

### With Validation

```typescript
import { validateRequestBody } from '@/lib/api/error-middleware';
import { createLeadSchema } from '@/lib/validation';

export const POST = withAuth(async (request, context) => {
  const body = await validateRequestBody(request, createLeadSchema);
  // body is now validated and typed
  return NextResponse.json({ lead: body });
});
```

## Validation Helpers

```typescript
import {
  validateEmail,
  validatePhone,
  validateFileSize,
  validateFileType,
  validateRequiredFields
} from '@/lib/errors';

// Validate email
if (!validateEmail(email)) {
  throw new ValidationError('Invalid email');
}

// Validate phone
if (!validatePhone(phone)) {
  throw new ValidationError('Invalid phone number');
}

// Validate file size (max 5MB)
if (!validateFileSize(fileSize, 5)) {
  throw new AppError(ErrorCodes.FILE_TOO_LARGE, 'File too large', 413);
}

// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!validateFileType(mimeType, allowedTypes)) {
  throw new ValidationError('Invalid file type');
}

// Validate required fields
const errors = validateRequiredFields(data, [
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' }
]);
if (errors.length > 0) {
  throw new ValidationError('Validation failed', errors);
}
```

## Error Logging

```typescript
import { logError } from '@/lib/errors';

try {
  // Your logic
} catch (error) {
  await logError(error, {
    userId: user.id,
    leadId: lead.id,
    action: 'CREATE_LEAD',
    entityType: 'lead',
    entityId: lead.id
  });
  throw error;
}
```

## User-Friendly Messages

The system automatically provides user-friendly messages for all error codes:

```typescript
import { getUserFriendlyMessage, ErrorCodes } from '@/lib/errors';

const message = getUserFriendlyMessage(ErrorCodes.UNAUTHORIZED);
// Returns: "Please log in to continue"
```

## Best Practices

1. **Always use error classes**: Don't throw raw strings or generic errors
2. **Provide context**: Include relevant details in error messages
3. **Log errors**: Use `logError()` for important errors
4. **Use middleware**: Leverage `withAuth`, `withRoles` for consistent handling
5. **Validate early**: Validate input as early as possible
6. **Be specific**: Use specific error codes rather than generic ones
7. **Don't expose internals**: Sanitize error messages for users

## Examples

See `src/app/api/example-error-handling/route.ts` for comprehensive examples of all error handling patterns.
