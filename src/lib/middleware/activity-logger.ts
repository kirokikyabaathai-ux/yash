/**
 * Activity Logger Middleware
 * 
 * Provides utilities for logging all CRUD operations to the activity_log table.
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type ActivityLog = Database['public']['Tables']['activity_log']['Insert'];

export interface LogActivityParams {
  leadId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

/**
 * Log an activity to the activity_log table
 * 
 * @param params - Activity log parameters
 * @returns Promise<void>
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const { auth } = await import('@/lib/auth/auth');
    const session = await auth();
    const user = session?.user;
    
    if (!user) {
      console.error('Failed to get user for activity logging: No session');
      return;
    }

    const supabase = await createClient();

    const logEntry: ActivityLog = {
      lead_id: params.leadId || null,
      user_id: user.id,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      old_value: params.oldValue || null,
      new_value: params.newValue || null,
      timestamp: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('activity_log')
      .insert(logEntry);

    if (insertError) {
      console.error('Failed to insert activity log:', insertError);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
}

/**
 * Log a lead operation (create, update, delete)
 * 
 * @param action - The action performed (create, update, delete)
 * @param leadId - The lead ID
 * @param oldValue - The old lead data (for updates/deletes)
 * @param newValue - The new lead data (for creates/updates)
 */
export async function logLeadOperation(
  action: 'create' | 'update' | 'delete',
  leadId: string,
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): Promise<void> {
  await logActivity({
    leadId,
    action: `lead_${action}`,
    entityType: 'lead',
    entityId: leadId,
    oldValue,
    newValue,
  });
}

/**
 * Log a document operation (upload, delete)
 * 
 * @param action - The action performed (upload, delete)
 * @param leadId - The lead ID
 * @param documentId - The document ID
 * @param documentDetails - Document metadata
 */
export async function logDocumentOperation(
  action: 'upload' | 'delete' | 'mark_corrupted',
  leadId: string,
  documentId: string,
  documentDetails?: Record<string, any>
): Promise<void> {
  await logActivity({
    leadId,
    action: `document_${action}`,
    entityType: 'document',
    entityId: documentId,
    newValue: documentDetails,
  });
}

/**
 * Log a step operation (complete, reopen)
 * 
 * @param action - The action performed (complete, reopen)
 * @param leadId - The lead ID
 * @param stepId - The step ID
 * @param oldValue - The old step data
 * @param newValue - The new step data
 */
export async function logStepOperation(
  action: 'complete' | 'reopen',
  leadId: string,
  stepId: string,
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): Promise<void> {
  await logActivity({
    leadId,
    action: `step_${action}`,
    entityType: 'lead_step',
    entityId: stepId,
    oldValue,
    newValue,
  });
}

/**
 * Log a step master operation (create, update, delete, reorder)
 * 
 * @param action - The action performed
 * @param stepId - The step ID
 * @param oldValue - The old step data
 * @param newValue - The new step data
 */
export async function logStepMasterOperation(
  action: 'create' | 'update' | 'delete' | 'reorder',
  stepId: string,
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): Promise<void> {
  await logActivity({
    action: `step_master_${action}`,
    entityType: 'step_master',
    entityId: stepId,
    oldValue,
    newValue,
  });
}

/**
 * Log a user operation (create, update, disable, enable)
 * 
 * @param action - The action performed
 * @param userId - The user ID
 * @param oldValue - The old user data
 * @param newValue - The new user data
 */
export async function logUserOperation(
  action: 'create' | 'update' | 'disable' | 'enable',
  userId: string,
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): Promise<void> {
  await logActivity({
    action: `user_${action}`,
    entityType: 'user',
    entityId: userId,
    oldValue,
    newValue,
  });
}
