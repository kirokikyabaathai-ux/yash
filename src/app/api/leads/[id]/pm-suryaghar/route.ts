/**
 * PM Suryaghar Form API Routes - GET, POST, PATCH
 * 
 * Handles PM Suryaghar form operations for a specific lead.
 * Validates user permissions (Agent for own leads, Customer for linked lead, Office/Admin for all).
 * Triggers status update if conditions met.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type PMSuryagharForm = Database['public']['Tables']['pm_suryaghar_form']['Row'];
type PMSuryagharFormInsert = Database['public']['Tables']['pm_suryaghar_form']['Insert'];
type PMSuryagharFormUpdate = Database['public']['Tables']['pm_suryaghar_form']['Update'];

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/leads/[id]/pm-suryaghar
 * 
 * Gets the PM Suryaghar form for a lead.
 * Returns 404 if form doesn't exist or user doesn't have access.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id: leadId } = await params;

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'User profile not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if user has access to this lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, created_by, customer_account_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Validate permissions
    const hasAccess =
      userProfile.role === 'admin' ||
      userProfile.role === 'office' ||
      (userProfile.role === 'agent' && lead.created_by === user.id) ||
      (userProfile.role === 'customer' && lead.customer_account_id === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this form',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Get PM Suryaghar form
    const { data: form, error: formError } = await supabase
      .from('pm_suryaghar_form')
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (formError) {
      if (formError.code === 'PGRST116') {
        // No form found
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'PM Suryaghar form not found for this lead',
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 }
        );
      }
      throw formError;
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching PM Suryaghar form:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch form',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads/[id]/pm-suryaghar
 * 
 * Creates a new PM Suryaghar form for a lead.
 * Validates user permissions and triggers status update if conditions met.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id: leadId } = await params;

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'User profile not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if user has access to this lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, created_by, customer_account_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Validate permissions (Agent for own leads, Customer for linked lead, Office/Admin for all)
    const hasAccess =
      userProfile.role === 'admin' ||
      userProfile.role === 'office' ||
      (userProfile.role === 'agent' && lead.created_by === user.id) ||
      (userProfile.role === 'customer' && lead.customer_account_id === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to submit this form',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!body.applicant_name?.trim()) {
      errors.push({ field: 'applicant_name', message: 'Applicant name is required' });
    }
    if (!body.applicant_phone?.trim()) {
      errors.push({ field: 'applicant_phone', message: 'Applicant phone is required' });
    }
    if (!body.property_address?.trim()) {
      errors.push({ field: 'property_address', message: 'Property address is required' });
    }
    if (!body.property_type?.trim()) {
      errors.push({ field: 'property_type', message: 'Property type is required' });
    }
    if (!body.roof_type?.trim()) {
      errors.push({ field: 'roof_type', message: 'Roof type is required' });
    }
    if (!body.kw_requirement || body.kw_requirement <= 0) {
      errors.push({ field: 'kw_requirement', message: 'Valid KW requirement is required' });
    }
    if (!body.aadhar_number?.trim() || !/^\d{12}$/.test(body.aadhar_number)) {
      errors.push({ field: 'aadhar_number', message: 'Valid 12-digit Aadhar number is required' });
    }
    if (!body.pan_number?.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.pan_number)) {
      errors.push({ field: 'pan_number', message: 'Valid PAN number is required' });
    }
    if (!body.bank_account_number?.trim()) {
      errors.push({ field: 'bank_account_number', message: 'Bank account number is required' });
    }
    if (!body.bank_ifsc?.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(body.bank_ifsc)) {
      errors.push({ field: 'bank_ifsc', message: 'Valid IFSC code is required' });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { errors },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Check if form already exists
    const { data: existingForm } = await supabase
      .from('pm_suryaghar_form')
      .select('id')
      .eq('lead_id', leadId)
      .single();

    if (existingForm) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'PM Suryaghar form already exists for this lead',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 409 }
      );
    }

    // Create form data
    const formData: PMSuryagharFormInsert = {
      lead_id: leadId,
      applicant_name: body.applicant_name,
      applicant_phone: body.applicant_phone,
      applicant_email: body.applicant_email || null,
      property_address: body.property_address,
      property_type: body.property_type,
      roof_type: body.roof_type,
      roof_area: body.roof_area || null,
      kw_requirement: body.kw_requirement,
      aadhar_number: body.aadhar_number,
      pan_number: body.pan_number,
      bank_account_number: body.bank_account_number,
      bank_ifsc: body.bank_ifsc,
      additional_data: body.additional_data || null,
      submitted_by: user.id,
    };

    // Insert form
    const { data: newForm, error: insertError } = await supabase
      .from('pm_suryaghar_form')
      .insert(formData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Call RPC function to update lead status if conditions met
    // (PM form submitted AND all mandatory documents uploaded)
    try {
      await supabase.rpc('update_lead_status', { p_lead_id: leadId });
    } catch (rpcError) {
      // Log error but don't fail the request
      console.error('Error updating lead status:', rpcError);
    }

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('Error creating PM Suryaghar form:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create form',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]/pm-suryaghar
 * 
 * Updates an existing PM Suryaghar form for a lead.
 * Validates user permissions.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    const { id: leadId } = await params;

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'User profile not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if user has access to this lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, created_by, customer_account_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found or access denied',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Validate permissions
    const hasAccess =
      userProfile.role === 'admin' ||
      userProfile.role === 'office' ||
      (userProfile.role === 'agent' && lead.created_by === user.id) ||
      (userProfile.role === 'customer' && lead.customer_account_id === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this form',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Check if form exists
    const { data: existingForm, error: formError } = await supabase
      .from('pm_suryaghar_form')
      .select('id')
      .eq('lead_id', leadId)
      .single();

    if (formError || !existingForm) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'PM Suryaghar form not found for this lead',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: PMSuryagharFormUpdate = {};

    if (body.applicant_name !== undefined) updateData.applicant_name = body.applicant_name;
    if (body.applicant_phone !== undefined) updateData.applicant_phone = body.applicant_phone;
    if (body.applicant_email !== undefined) updateData.applicant_email = body.applicant_email;
    if (body.property_address !== undefined) updateData.property_address = body.property_address;
    if (body.property_type !== undefined) updateData.property_type = body.property_type;
    if (body.roof_type !== undefined) updateData.roof_type = body.roof_type;
    if (body.roof_area !== undefined) updateData.roof_area = body.roof_area;
    if (body.kw_requirement !== undefined) updateData.kw_requirement = body.kw_requirement;
    if (body.aadhar_number !== undefined) updateData.aadhar_number = body.aadhar_number;
    if (body.pan_number !== undefined) updateData.pan_number = body.pan_number;
    if (body.bank_account_number !== undefined) updateData.bank_account_number = body.bank_account_number;
    if (body.bank_ifsc !== undefined) updateData.bank_ifsc = body.bank_ifsc;
    if (body.additional_data !== undefined) updateData.additional_data = body.additional_data;

    // Update form
    const { data: updatedForm, error: updateError } = await supabase
      .from('pm_suryaghar_form')
      .update(updateData)
      .eq('lead_id', leadId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('Error updating PM Suryaghar form:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update form',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
