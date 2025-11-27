/**
 * API Request and Response Type Definitions
 * 
 * These types define the structure of API requests and responses
 * for the Solar CRM application.
 */

import type {
  UserRole,
  UserStatus,
  LeadStatus,
  LeadSource,
  DocumentType,
  DocumentStatus,
  StepStatus,
} from './database';

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assigned_area: string | null;
  agent_id: string | null;
  office_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  assigned_area?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  assigned_area?: string;
}

// ============================================================================
// Lead Types
// ============================================================================

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string | null;
  status: LeadStatus;
  created_by: string | null;
  customer_account_id: string | null;
  installer_id: string | null;
  source: LeadSource;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateLeadRequest {
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  source: LeadSource;
}

export interface UpdateLeadRequest {
  customer_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: LeadStatus;
  installer_id?: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus[];
  dateFrom?: string;
  dateTo?: string;
  currentStep?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string;
  lead_id: string;
  type: DocumentType;
  document_category: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  status: DocumentStatus;
  uploaded_at: string;
}

export interface UploadUrlRequest {
  lead_id: string;
  document_type: DocumentType;
  document_category: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  filePath: string;
  expiresAt: number;
}

export interface CreateDocumentRequest {
  lead_id: string;
  type: DocumentType;
  document_category: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface UpdateDocumentRequest {
  status?: DocumentStatus;
}

// ============================================================================
// Timeline Types
// ============================================================================

export interface StepMaster {
  id: string;
  step_name: string;
  order_index: number;
  allowed_roles: UserRole[];
  remarks_required: boolean;
  attachments_allowed: boolean;
  customer_upload: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadStep {
  id: string;
  lead_id: string;
  step_id: string;
  status: StepStatus;
  completed_by: string | null;
  completed_at: string | null;
  remarks: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineStepView {
  step: StepMaster;
  leadStep: LeadStep;
  canEdit: boolean;
  canComplete: boolean;
}

export interface CreateStepMasterRequest {
  step_name: string;
  order_index: number;
  allowed_roles: UserRole[];
  remarks_required?: boolean;
  attachments_allowed?: boolean;
  customer_upload?: boolean;
}

export interface UpdateStepMasterRequest {
  step_name?: string;
  order_index?: number;
  allowed_roles?: UserRole[];
  remarks_required?: boolean;
  attachments_allowed?: boolean;
  customer_upload?: boolean;
}

export interface ReorderStepsRequest {
  steps: Array<{
    id: string;
    order_index: number;
  }>;
}

export interface CompleteStepRequest {
  remarks?: string;
  attachments?: string[];
}

// ============================================================================
// ============================================================================
// Activity Log Types
// ============================================================================

export interface ActivityLog {
  id: string;
  lead_id: string | null;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  timestamp: string;
}

export interface ActivityLogFilters {
  lead_id?: string;
  user_id?: string;
  action?: string;
  entity_type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogListResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  lead_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardMetrics {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsByStep: Record<string, number>;
  conversionRate: {
    ongoingToInterested: number;
    interestedToClosed: number;
    overallConversion: number;
  };
  pendingActions: number;
  recentActivity: ActivityLog[];
}

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: LeadStatus[];
  assignedTo?: string;
  currentStep?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      errors: ValidationError[];
    };
    timestamp: string;
  };
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
