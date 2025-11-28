# Validation System

This directory contains the validation schemas and helpers for the YAS Natural application.

## Overview

The validation system provides:
- Zod schemas for all forms and API requests
- Type-safe validation with TypeScript inference
- Consistent validation rules across client and server
- Helper functions for common validation tasks

## Schemas

All validation schemas are defined in `schemas.ts` using Zod.

### Authentication Schemas

```typescript
import { loginSchema, signupSchema } from '@/lib/validation';

// Login validation
const result = loginSchema.safeParse({
  email: 'user@example.com',
  password: 'password123'
});

// Signup validation
const signupResult = signupSchema.safeParse({
  email: 'user@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  name: 'John Doe',
  phone: '+1234567890'
});
```

### Lead Management Schemas

```typescript
import { createLeadSchema, updateLeadSchema } from '@/lib/validation';

// Create lead validation
const lead = createLeadSchema.parse({
  customer_name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  source: 'agent'
});

// Update lead validation
const updates = updateLeadSchema.parse({
  customer_name: 'Jane Doe',
  status: 'interested'
});
```

### Document Management Schemas

```typescript
import { uploadUrlRequestSchema, createDocumentSchema } from '@/lib/validation';

// Upload URL request validation
const uploadRequest = uploadUrlRequestSchema.parse({
  lead_id: 'uuid-here',
  document_type: 'mandatory',
  document_category: 'aadhar_front',
  file_name: 'aadhar.jpg',
  file_size: 1024000,
  mime_type: 'image/jpeg'
});
```

### Timeline Schemas

```typescript
import { createStepMasterSchema, completeStepSchema } from '@/lib/validation';

// Step master validation
const step = createStepMasterSchema.parse({
  step_name: 'Document Verification',
  order_index: 1,
  allowed_roles: ['admin', 'office'],
  remarks_required: true,
  attachments_allowed: false,
  customer_upload: false
});

// Complete step validation
const completion = completeStepSchema.parse({
  remarks: 'All documents verified',
  attachments: []
});
```

### PM Suryaghar Form Schema

```typescript
import { pmSuryagharFormSchema } from '@/lib/validation';

const form = pmSuryagharFormSchema.parse({
  lead_id: 'uuid-here',
  applicant_name: 'John Doe',
  applicant_phone: '+1234567890',
  applicant_email: 'john@example.com',
  property_address: '123 Main St',
  property_type: 'Residential',
  aadhar_number: '123456789012',
  pan_number: 'ABCDE1234F',
  bank_account_number: '1234567890',
  bank_ifsc: 'ABCD0123456'
});
```

## Validation Helpers

### validateSchema

Validates data against a schema and returns formatted errors:

```typescript
import { validateSchema } from '@/lib/validation';
import { createLeadSchema } from '@/lib/validation';

const result = validateSchema(createLeadSchema, data);

if (result.success) {
  // result.data is typed and validated
  console.log(result.data);
} else {
  // result.errors contains formatted validation errors
  console.log(result.errors);
}
```

### validateOrThrow

Validates data and throws if invalid:

```typescript
import { validateOrThrow } from '@/lib/validation';

try {
  const validData = validateOrThrow(createLeadSchema, data);
  // validData is typed and validated
} catch (error) {
  // Handle validation error
}
```

### formatZodErrors

Formats Zod errors into a consistent structure:

```typescript
import { formatZodErrors } from '@/lib/validation';
import { z } from 'zod';

try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodErrors(error);
    // [{ field: 'email', message: 'Invalid email' }]
  }
}
```

### Sanitization Helpers

```typescript
import {
  sanitizeString,
  parseNumber,
  parseInteger,
  sanitizeFormData
} from '@/lib/validation';

// Sanitize string (trim whitespace)
const clean = sanitizeString('  hello  '); // 'hello'

// Parse number
const num = parseNumber('123.45'); // 123.45

// Parse integer
const int = parseInteger('123'); // 123

// Sanitize form data
const sanitized = sanitizeFormData({
  name: '  John  ',
  email: 'john@example.com  ',
  age: 25
});
// { name: 'John', email: 'john@example.com', age: 25 }
```

### UUID Validation

```typescript
import { isValidUUID } from '@/lib/validation';

if (isValidUUID(id)) {
  // Valid UUID
}
```

## Usage in API Routes

### Server-Side Validation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateRequestBody } from '@/lib/api/error-middleware';
import { createLeadSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  // Automatically validates and throws on error
  const body = await validateRequestBody(request, createLeadSchema);
  
  // body is now typed and validated
  return NextResponse.json({ lead: body });
}
```

### Manual Validation

```typescript
import { validateSchema } from '@/lib/validation';
import { createLeadSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const result = validateSchema(createLeadSchema, data);
  
  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { errors: result.errors },
          timestamp: new Date().toISOString()
        }
      },
      { status: 400 }
    );
  }
  
  // Use result.data
  return NextResponse.json({ lead: result.data });
}
```

## Usage in React Components

### With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeadSchema, type CreateLeadInput } from '@/lib/validation';

function LeadForm() {
  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      address: '',
      source: 'agent'
    }
  });
  
  const onSubmit = async (data: CreateLeadInput) => {
    // data is validated and typed
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Client-Side Validation

```typescript
import { validateSchema } from '@/lib/validation';
import { loginSchema } from '@/lib/validation';

function handleLogin(data: unknown) {
  const result = validateSchema(loginSchema, data);
  
  if (!result.success) {
    // Show validation errors
    setErrors(result.errors);
    return;
  }
  
  // Proceed with login
  login(result.data);
}
```

## Type Inference

All schemas export TypeScript types:

```typescript
import type {
  LoginInput,
  SignupInput,
  CreateLeadInput,
  UpdateLeadInput,
  CreateDocumentInput,
  PMSuryagharFormInput
} from '@/lib/validation';

// Use in function signatures
function createLead(data: CreateLeadInput) {
  // data is fully typed
}
```

## Custom Validation Rules

### Email Validation
- Must be a valid email format
- Required for most forms

### Phone Validation
- Must match pattern: `^\+?[\d\s-()]{10,}$`
- Allows international format with +
- Minimum 10 digits

### Password Validation
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Aadhar Number
- Must be exactly 12 digits
- Pattern: `^\d{12}$`

### PAN Number
- Must match format: 5 letters, 4 digits, 1 letter
- Pattern: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
- Example: ABCDE1234F

### IFSC Code
- Must match format: 4 letters, 0, 6 alphanumeric
- Pattern: `^[A-Z]{4}0[A-Z0-9]{6}$`
- Example: ABCD0123456

### Bank Account Number
- Must be 9-18 digits
- Pattern: `^\d{9,18}$`

## File Validation

### Allowed MIME Types
```typescript
import { allowedDocumentMimeTypes } from '@/lib/validation';

// ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
```

### File Size Limits
- Maximum file size: 5MB (5 * 1024 * 1024 bytes)
- Validated in `uploadUrlRequestSchema`

## Best Practices

1. **Always validate on both client and server**: Client-side for UX, server-side for security
2. **Use type inference**: Let TypeScript infer types from schemas
3. **Provide clear error messages**: Use descriptive validation messages
4. **Sanitize input**: Use sanitization helpers before validation
5. **Validate early**: Validate as soon as data enters the system
6. **Reuse schemas**: Don't duplicate validation logic
7. **Keep schemas simple**: Break complex schemas into smaller pieces

## Adding New Schemas

When adding a new schema:

1. Define the schema in `schemas.ts`
2. Export the schema and its inferred type
3. Add validation rules with clear error messages
4. Document the schema in this README
5. Use the schema in both API routes and forms

Example:

```typescript
// In schemas.ts
export const myNewSchema = z.object({
  field1: z.string().min(1, 'Field 1 is required'),
  field2: z.number().positive('Field 2 must be positive')
});

export type MyNewInput = z.infer<typeof myNewSchema>;
```
