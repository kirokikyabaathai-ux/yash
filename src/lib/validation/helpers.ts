/**
 * Validation Helper Functions
 * 
 * Provides utility functions for validation and error formatting.
 */

import { z } from 'zod';
import type { ValidationError } from '@/types/api';

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = (result.error?.errors || []).map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return { success: false, errors };
}

/**
 * Formats Zod errors into ValidationError array
 */
export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return (error?.errors || []).map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validates data and throws if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validates data asynchronously
 */
export async function validateSchemaAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: ValidationError[] }> {
  const result = await schema.safeParseAsync(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = result.error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return { success: false, errors };
}

/**
 * Creates a validation error message from multiple errors
 */
export function createValidationMessage(errors: ValidationError[]): string {
  if (errors.length === 0) return 'Validation failed';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} validation errors occurred`;
}

/**
 * Checks if a value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Sanitizes string input by trimming whitespace
 */
export function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Parses a number from string or number input
 */
export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Parses an integer from string or number input
 */
export function parseInteger(value: unknown): number | undefined {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Validates and sanitizes form data
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      sanitized[key] = trimmed === '' ? undefined : trimmed;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
