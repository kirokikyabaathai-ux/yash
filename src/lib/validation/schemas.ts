/**
 * Zod Validation Schemas
 * 
 * Defines validation schemas for all forms in the Solar CRM application.
 * These schemas are used for both client-side and server-side validation.
 */

import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const customerSignupSchema = signupSchema;

// ============================================================================
// User Management Schemas
// ============================================================================

export const userRoleSchema = z.enum(['admin', 'agent', 'office', 'installer', 'customer']);
export const userStatusSchema = z.enum(['active', 'disabled']);

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format'),
  role: userRoleSchema,
  assigned_area: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format')
    .optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  assigned_area: z.string().optional(),
});

// ============================================================================
// Lead Management Schemas
// ============================================================================

export const leadStatusSchema = z.enum(['ongoing', 'interested', 'not_interested', 'closed']);
export const leadSourceSchema = z.enum(['agent', 'office', 'customer', 'self']);

export const createLeadSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Customer name is required')
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must not exceed 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must not exceed 500 characters'),
  kw_requirement: z
    .number()
    .positive('KW requirement must be positive')
    .max(1000, 'KW requirement must not exceed 1000')
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  roof_type: z
    .string()
    .max(50, 'Roof type must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  source: leadSourceSchema,
});

export const updateLeadSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must not exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  kw_requirement: z
    .number()
    .positive('KW requirement must be positive')
    .max(1000, 'KW requirement must not exceed 1000')
    .optional(),
  roof_type: z
    .string()
    .max(50, 'Roof type must not exceed 50 characters')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  status: leadStatusSchema.optional(),
  installer_id: z.string().uuid('Invalid installer ID').optional(),
});

// ============================================================================
// Document Management Schemas
// ============================================================================

export const documentTypeSchema = z.enum(['mandatory', 'optional', 'installation', 'customer', 'admin']);
export const documentCategorySchema = z.enum([
  'aadhar_front',
  'aadhar_back',
  'bijli_bill',
  'bank_passbook',
  'cancelled_cheque',
  'pan_card',
  'itr',
  'other',
]);
export const documentStatusSchema = z.enum(['valid', 'corrupted', 'replaced']);

export const uploadUrlRequestSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  document_type: documentTypeSchema,
  document_category: documentCategorySchema,
  file_name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters'),
  file_size: z
    .number()
    .positive('File size must be positive')
    .max(5 * 1024 * 1024, 'File size must not exceed 5MB'),
  mime_type: z
    .string()
    .min(1, 'MIME type is required')
    .regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
});

export const createDocumentSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  type: documentTypeSchema,
  document_category: documentCategorySchema,
  file_path: z.string().min(1, 'File path is required'),
  file_name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters'),
  file_size: z.number().positive('File size must be positive'),
  mime_type: z.string().min(1, 'MIME type is required'),
});

export const updateDocumentSchema = z.object({
  status: documentStatusSchema.optional(),
});

// Allowed file types for documents
export const allowedDocumentMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// ============================================================================
// Timeline Schemas
// ============================================================================

export const stepStatusSchema = z.enum(['upcoming', 'pending', 'completed']);

export const createStepMasterSchema = z.object({
  step_name: z
    .string()
    .min(1, 'Step name is required')
    .min(3, 'Step name must be at least 3 characters')
    .max(100, 'Step name must not exceed 100 characters'),
  order_index: z
    .number()
    .int('Order index must be an integer')
    .nonnegative('Order index must be non-negative'),
  allowed_roles: z
    .array(userRoleSchema)
    .min(1, 'At least one role must be allowed'),
  remarks_required: z.boolean().default(false),
  attachments_allowed: z.boolean().default(false),
  customer_upload: z.boolean().default(false),
});

export const updateStepMasterSchema = z.object({
  step_name: z
    .string()
    .min(3, 'Step name must be at least 3 characters')
    .max(100, 'Step name must not exceed 100 characters')
    .optional(),
  order_index: z
    .number()
    .int('Order index must be an integer')
    .nonnegative('Order index must be non-negative')
    .optional(),
  allowed_roles: z
    .array(userRoleSchema)
    .min(1, 'At least one role must be allowed')
    .optional(),
  remarks_required: z.boolean().optional(),
  attachments_allowed: z.boolean().optional(),
  customer_upload: z.boolean().optional(),
});

export const reorderStepsSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string().uuid('Invalid step ID'),
      order_index: z
        .number()
        .int('Order index must be an integer')
        .nonnegative('Order index must be non-negative'),
    })
  ).min(1, 'At least one step is required'),
});

export const completeStepSchema = z.object({
  remarks: z
    .string()
    .max(1000, 'Remarks must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  attachments: z.array(z.string()).optional(),
});

// ============================================================================
// PM Suryaghar Form Schema
// ============================================================================

export const pmSuryagharFormSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  applicant_name: z
    .string()
    .min(1, 'Applicant name is required')
    .min(2, 'Applicant name must be at least 2 characters')
    .max(100, 'Applicant name must not exceed 100 characters'),
  applicant_phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format'),
  applicant_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  property_address: z
    .string()
    .min(1, 'Property address is required')
    .min(5, 'Property address must be at least 5 characters')
    .max(500, 'Property address must not exceed 500 characters'),
  property_type: z
    .string()
    .min(1, 'Property type is required')
    .max(50, 'Property type must not exceed 50 characters'),
  roof_type: z
    .string()
    .min(1, 'Roof type is required')
    .max(50, 'Roof type must not exceed 50 characters'),
  roof_area: z
    .number()
    .positive('Roof area must be positive')
    .max(10000, 'Roof area must not exceed 10000 sq ft')
    .optional()
    .or(z.string().transform((val) => (val ? parseFloat(val) : undefined))),
  kw_requirement: z
    .number()
    .positive('KW requirement must be positive')
    .max(1000, 'KW requirement must not exceed 1000')
    .or(z.string().transform((val) => parseFloat(val))),
  aadhar_number: z
    .string()
    .min(1, 'Aadhar number is required')
    .regex(/^\d{12}$/, 'Aadhar number must be 12 digits'),
  pan_number: z
    .string()
    .min(1, 'PAN number is required')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
  bank_account_number: z
    .string()
    .min(1, 'Bank account number is required')
    .regex(/^\d{9,18}$/, 'Bank account number must be 9-18 digits'),
  bank_ifsc: z
    .string()
    .min(1, 'IFSC code is required')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  additional_data: z.record(z.any()).optional(),
});

export const updatePMSuryagharFormSchema = pmSuryagharFormSchema.partial().omit({ lead_id: true });

// ============================================================================
// Search and Filter Schemas
// ============================================================================

export const leadFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(leadStatusSchema).optional(),
  dateFrom: z.string().datetime().optional().or(z.literal('')),
  dateTo: z.string().datetime().optional().or(z.literal('')),
  currentStep: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});

export const activityLogFiltersSchema = z.object({
  lead_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  dateFrom: z.string().datetime().optional().or(z.literal('')),
  dateTo: z.string().datetime().optional().or(z.literal('')),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});

// ============================================================================
// Dashboard Schemas
// ============================================================================

export const dashboardFiltersSchema = z.object({
  dateFrom: z.string().datetime().optional().or(z.literal('')),
  dateTo: z.string().datetime().optional().or(z.literal('')),
  status: z.array(leadStatusSchema).optional(),
  assignedTo: z.string().uuid().optional(),
  currentStep: z.string().uuid().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UploadUrlRequestInput = z.infer<typeof uploadUrlRequestSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateStepMasterInput = z.infer<typeof createStepMasterSchema>;
export type UpdateStepMasterInput = z.infer<typeof updateStepMasterSchema>;
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>;
export type CompleteStepInput = z.infer<typeof completeStepSchema>;
export type PMSuryagharFormInput = z.infer<typeof pmSuryagharFormSchema>;
export type UpdatePMSuryagharFormInput = z.infer<typeof updatePMSuryagharFormSchema>;
export type LeadFiltersInput = z.infer<typeof leadFiltersSchema>;
export type ActivityLogFiltersInput = z.infer<typeof activityLogFiltersSchema>;
export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;
