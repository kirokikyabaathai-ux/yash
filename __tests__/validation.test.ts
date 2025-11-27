/**
 * Unit Tests for Validation System
 * 
 * Tests the Zod schemas and validation helpers.
 */

import {
  loginSchema,
  signupSchema,
  createLeadSchema,
  updateLeadSchema,
  createUserSchema,
  updateUserSchema,
  uploadUrlRequestSchema,
  createDocumentSchema,
  createStepMasterSchema,
  completeStepSchema,
  pmSuryagharFormSchema,
  leadFiltersSchema,
  validateSchema,
  validateOrThrow,
  formatZodErrors,
  sanitizeString,
  parseNumber,
  parseInteger,
  sanitizeFormData,
  isValidUUID,
} from '@/lib/validation';
import { z } from 'zod';

describe('Authentication Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const data = {
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: 'short',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe',
        phone: '+1234567890',
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const data = {
        email: 'user@example.com',
        password: 'securepass123',
        confirmPassword: 'securepass123',
        name: 'John Doe',
        phone: '+1234567890',
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass',
        confirmPassword: 'SecurePass',
        name: 'John Doe',
        phone: '+1234567890',
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
        name: 'John Doe',
        phone: '+1234567890',
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe',
        phone: '123',
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Lead Management Schemas', () => {
  describe('createLeadSchema', () => {
    it('should validate correct lead data', () => {
      const data = {
        customer_name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St, City',
        notes: 'Some notes',
        source: 'agent',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept optional fields as empty', () => {
      const data = {
        customer_name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St',
        source: 'agent',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const data = {
        customer_name: 'John Doe',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid source', () => {
      const data = {
        customer_name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St',
        source: 'invalid',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

  });

  describe('updateLeadSchema', () => {
    it('should validate partial updates', () => {
      const data = {
        customer_name: 'Jane Doe',
        status: 'application_submitted',
      };

      const result = updateLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateLeadSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('Document Management Schemas', () => {
  describe('uploadUrlRequestSchema', () => {
    it('should validate correct upload request', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        document_type: 'mandatory',
        document_category: 'aadhar_front',
        file_name: 'aadhar.jpg',
        file_size: 1024000,
        mime_type: 'image/jpeg',
      };

      const result = uploadUrlRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const data = {
        lead_id: 'invalid-uuid',
        document_type: 'mandatory',
        document_category: 'aadhar_front',
        file_name: 'aadhar.jpg',
        file_size: 1024000,
        mime_type: 'image/jpeg',
      };

      const result = uploadUrlRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject file size exceeding 5MB', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        document_type: 'mandatory',
        document_category: 'aadhar_front',
        file_name: 'aadhar.jpg',
        file_size: 6 * 1024 * 1024,
        mime_type: 'image/jpeg',
      };

      const result = uploadUrlRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Timeline Schemas', () => {
  describe('createStepMasterSchema', () => {
    it('should validate correct step master data', () => {
      const data = {
        step_name: 'Document Verification',
        order_index: 1,
        allowed_roles: ['admin', 'office'],
        remarks_required: true,
        attachments_allowed: false,
        customer_upload: false,
      };

      const result = createStepMasterSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty allowed_roles', () => {
      const data = {
        step_name: 'Document Verification',
        order_index: 1,
        allowed_roles: [],
      };

      const result = createStepMasterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative order_index', () => {
      const data = {
        step_name: 'Document Verification',
        order_index: -1,
        allowed_roles: ['admin'],
      };

      const result = createStepMasterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('completeStepSchema', () => {
    it('should validate step completion data', () => {
      const data = {
        remarks: 'All documents verified',
        attachments: ['file1.pdf', 'file2.pdf'],
      };

      const result = completeStepSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty data', () => {
      const result = completeStepSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('PM Suryaghar Form Schema', () => {
  describe('pmSuryagharFormSchema', () => {
    it('should validate correct form data', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        applicant_name: 'John Doe',
        applicant_phone: '+1234567890',
        applicant_email: 'john@example.com',
        property_address: '123 Main St, City',
        property_type: 'Residential',
        aadhar_number: '123456789012',
        pan_number: 'ABCDE1234F',
        bank_account_number: '1234567890',
        bank_ifsc: 'ABCD0123456',
      };

      const result = pmSuryagharFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Aadhar number', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        applicant_name: 'John Doe',
        applicant_phone: '+1234567890',
        property_address: '123 Main St',
        property_type: 'Residential',
        aadhar_number: '12345', // Invalid: not 12 digits
        pan_number: 'ABCDE1234F',
        bank_account_number: '1234567890',
        bank_ifsc: 'ABCD0123456',
      };

      const result = pmSuryagharFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid PAN number', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        applicant_name: 'John Doe',
        applicant_phone: '+1234567890',
        property_address: '123 Main St',
        property_type: 'Residential',
        aadhar_number: '123456789012',
        pan_number: 'INVALID', // Invalid format
        bank_account_number: '1234567890',
        bank_ifsc: 'ABCD0123456',
      };

      const result = pmSuryagharFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid IFSC code', () => {
      const data = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        applicant_name: 'John Doe',
        applicant_phone: '+1234567890',
        property_address: '123 Main St',
        property_type: 'Residential',
        aadhar_number: '123456789012',
        pan_number: 'ABCDE1234F',
        bank_account_number: '1234567890',
        bank_ifsc: 'INVALID', // Invalid format
      };

      const result = pmSuryagharFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Helpers', () => {
  describe('validateSchema', () => {
    it('should return success for valid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const data = { name: 'John', age: 30 };

      const result = validateSchema(schema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return formatted errors for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const data = { name: 'John', age: 'invalid' as any };

      const result = validateSchema(schema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        // The result should have errors array
        expect(Array.isArray(result.errors)).toBe(true);
      }
    });
  });

  describe('validateOrThrow', () => {
    it('should return validated data for valid input', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 'John' };

      const result = validateOrThrow(schema, data);
      expect(result).toEqual(data);
    });

    it('should throw for invalid input', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 123 };

      expect(() => validateOrThrow(schema, data)).toThrow();
    });
  });

  describe('formatZodErrors', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      try {
        schema.parse({ name: 123 as any, email: 'invalid' });
        // Should not reach here
        fail('Should have thrown ZodError');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatZodErrors(error);
          expect(Array.isArray(formatted)).toBe(true);
        } else {
          fail('Should be a ZodError');
        }
      }
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('hello')).toBe('hello');
    });

    it('should return undefined for empty strings', () => {
      expect(sanitizeString('   ')).toBeUndefined();
      expect(sanitizeString('')).toBeUndefined();
    });

    it('should return undefined for non-strings', () => {
      expect(sanitizeString(123)).toBeUndefined();
      expect(sanitizeString(null)).toBeUndefined();
      expect(sanitizeString(undefined)).toBeUndefined();
    });
  });

  describe('parseNumber', () => {
    it('should parse numbers', () => {
      expect(parseNumber(123)).toBe(123);
      expect(parseNumber('123')).toBe(123);
      expect(parseNumber('123.45')).toBe(123.45);
    });

    it('should return undefined for invalid input', () => {
      expect(parseNumber('invalid')).toBeUndefined();
      expect(parseNumber(null)).toBeUndefined();
      expect(parseNumber(undefined)).toBeUndefined();
    });
  });

  describe('parseInteger', () => {
    it('should parse integers', () => {
      expect(parseInteger(123)).toBe(123);
      expect(parseInteger('123')).toBe(123);
      expect(parseInteger(123.45)).toBe(123);
    });

    it('should return undefined for invalid input', () => {
      expect(parseInteger('invalid')).toBeUndefined();
      expect(parseInteger(null)).toBeUndefined();
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize all string fields', () => {
      const data = {
        name: '  John  ',
        email: 'john@example.com  ',
        age: 30,
      };

      const sanitized = sanitizeFormData(data);
      expect(sanitized.name).toBe('John');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.age).toBe(30);
    });

    it('should convert empty strings to undefined', () => {
      const data = {
        name: '   ',
        email: '',
      };

      const sanitized = sanitizeFormData(data);
      expect(sanitized.name).toBeUndefined();
      expect(sanitized.email).toBeUndefined();
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('123-456-789')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });
});
