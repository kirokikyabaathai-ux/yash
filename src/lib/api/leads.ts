/**
 * Lead Data Access Layer
 * 
 * This module provides CRUD operations for leads with filtering and pagination.
 * All operations respect RLS policies enforced at the database level.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadFilters,
  LeadListResponse,
} from '@/types/api';
import type { Database } from '@/types/database';

/**
 * Creates a new lead
 * 
 * @param data - Lead creation data
 * @param userId - ID of the user creating the lead (for created_by field)
 * @param isServer - Whether this is called from server-side code
 * @returns Created lead
 */
export async function createLead(
  data: CreateLeadRequest,
  userId: string,
  isServer: boolean = false
): Promise<Lead> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const leadData: Database['public']['Tables']['leads']['Insert'] = {
    customer_name: data.customer_name,
    phone: data.phone,
    email: data.email || null,
    address: data.address,
    notes: data.notes || null,
    source: data.source,
    created_by: userId,
    status: 'lead', // Initial status as per Requirement 2.2
  };

  const { data: lead, error } = await supabase
    .from('leads')
    .insert(leadData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  // Initialize timeline for the new lead
  try {
    const { error: timelineError } = await supabase.rpc('initialize_lead_timeline', {
      p_lead_id: lead.id,
    });

    if (timelineError) {
      console.error('Failed to initialize timeline:', timelineError);
      // Don't throw - lead was created successfully, timeline can be initialized later
    }
  } catch (timelineErr) {
    console.error('Error initializing timeline:', timelineErr);
    // Don't throw - lead was created successfully
  }

  return lead as Lead;
}

/**
 * Gets a single lead by ID
 * 
 * RLS policies automatically filter based on user role:
 * - Admin/Office: Can access all leads
 * - Agent: Can only access their own leads
 * - Customer: Can only access their linked lead
 * - Installer: Can only access assigned leads
 * 
 * @param leadId - Lead ID
 * @param isServer - Whether this is called from server-side code
 * @returns Lead or null if not found/not authorized
 */
export async function getLead(
  leadId: string,
  isServer: boolean = false
): Promise<Lead | null> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      created_by_user:users!leads_created_by_fkey(id, name, email),
      customer_account:users!leads_customer_account_id_fkey(id, name, email, phone, customer_id),
      installer:users!leads_installer_id_fkey(id, name, phone)
    `)
    .eq('id', leadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - either doesn't exist or RLS filtered it out
      return null;
    }
    throw new Error(`Failed to get lead: ${error.message}`);
  }

  return lead as Lead;
}

/**
 * Updates a lead
 * 
 * @param leadId - Lead ID
 * @param data - Update data
 * @param isServer - Whether this is called from server-side code
 * @returns Updated lead
 */
export async function updateLead(
  leadId: string,
  data: UpdateLeadRequest,
  isServer: boolean = false
): Promise<Lead> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const updateData: Database['public']['Tables']['leads']['Update'] = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: lead, error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  return lead as Lead;
}

/**
 * Deletes a lead
 * 
 * @param leadId - Lead ID
 * @param isServer - Whether this is called from server-side code
 */
export async function deleteLead(
  leadId: string,
  isServer: boolean = false
): Promise<void> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}

/**
 * Gets leads with filtering and pagination
 * 
 * RLS policies automatically filter results based on user role.
 * Additional filters are applied on top of RLS filtering.
 * 
 * @param filters - Filter and pagination options
 * @param isServer - Whether this is called from server-side code
 * @returns Paginated lead list
 */
export async function getLeads(
  filters: LeadFilters = {},
  isServer: boolean = false
): Promise<LeadListResponse> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Start building the query
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' });

  // Apply status filter first (before search to ensure AND logic)
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  // Apply date range filter
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply assigned user filter
  if (filters.assignedTo) {
    query = query.eq('created_by', filters.assignedTo);
  }

  // Apply search filter (multi-field search)
  // Note: .or() in Supabase creates a separate OR condition
  // When combined with other filters, they are ANDed together
  // So this becomes: (status = X) AND (name LIKE Y OR phone LIKE Y OR ...)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `customer_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm}`
    );
  }

  // Apply current step filter (requires join with lead_steps)
  // This filters leads that have a specific step in "pending" status
  if (filters.currentStep) {
    // We need to filter leads that have a lead_step record with:
    // - step_id matching the filter
    // - status = 'pending' (current step)
    // This requires a subquery or join
    const { data: leadIdsWithStep } = await supabase
      .from('lead_steps')
      .select('lead_id')
      .eq('step_id', filters.currentStep)
      .eq('status', 'pending');

    if (leadIdsWithStep && leadIdsWithStep.length > 0) {
      const leadIds = leadIdsWithStep.map((ls) => ls.lead_id);
      query = query.in('id', leadIds);
    } else {
      // No leads match this step filter, return empty result
      return {
        leads: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  }

  // Apply pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: leads, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get leads: ${error.message}`);
  }

  const total = count || 0;
  const hasMore = offset + limit < total;

  return {
    leads: (leads || []) as Lead[],
    total,
    page,
    limit,
    hasMore,
  };
}

/**
 * Gets leads count by status
 * 
 * @param isServer - Whether this is called from server-side code
 * @returns Count of leads by status
 */
export async function getLeadCountByStatus(
  isServer: boolean = false
): Promise<Record<string, number>> {
  const supabase = isServer ? await createServerClient() : createBrowserClient();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('status');

  if (error) {
    throw new Error(`Failed to get lead counts: ${error.message}`);
  }

  const counts: Record<string, number> = {
    ongoing: 0,
    interested: 0,
    not_interested: 0,
    closed: 0,
  };

  leads?.forEach((lead) => {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  });

  return counts;
}
