/**
 * Customer Profile Draft API Route
 * POST - Save draft
 * GET - Get draft
 * DELETE - Delete draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/customer-profiles/draft?leadId=xxx
 * Get saved draft for current user and lead
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    // Get draft from customer_profiles with status = 'draft'
    const { data: draft, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
      .eq('status', 'draft')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching draft:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ draft: draft || null });
  } catch (error) {
    console.error('Error in draft GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer-profiles/draft
 * Save or update draft (JSON only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, draftData } = body;

    if (!leadId || !draftData) {
      return NextResponse.json(
        { error: 'leadId and draftData are required' },
        { status: 400 }
      );
    }

    // Check if draft exists in customer_profiles
    const { data: existingDraft } = await supabase
      .from('customer_profiles')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
      .eq('status', 'draft')
      .single();

    let result;

    if (existingDraft) {
      // Check if already submitted - cannot edit submitted profiles
      if (existingDraft.status === 'submitted') {
        return NextResponse.json(
          { error: 'Cannot edit submitted profile' },
          { status: 403 }
        );
      }

      // Update existing draft - only update provided fields
      const updateData: any = {
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      // Only include fields that are provided
      if (draftData.name !== undefined) updateData.name = draftData.name || '';
      if (draftData.gender !== undefined) updateData.gender = draftData.gender;
      if (draftData.address_line_1 !== undefined)
        updateData.address_line_1 = draftData.address_line_1 || '';
      if (draftData.address_line_2 !== undefined)
        updateData.address_line_2 = draftData.address_line_2;
      if (draftData.pin_code !== undefined)
        updateData.pin_code = draftData.pin_code || '';
      if (draftData.state !== undefined) updateData.state = draftData.state || '';
      if (draftData.district !== undefined)
        updateData.district = draftData.district || '';
      if (draftData.account_holder_name !== undefined)
        updateData.account_holder_name = draftData.account_holder_name || '';
      if (draftData.bank_account_number !== undefined)
        updateData.bank_account_number = draftData.bank_account_number || '';
      if (draftData.bank_name !== undefined)
        updateData.bank_name = draftData.bank_name || '';
      if (draftData.ifsc_code !== undefined)
        updateData.ifsc_code = draftData.ifsc_code || '';

      const { data, error } = await supabase
        .from('customer_profiles')
        .update(updateData)
        .eq('id', existingDraft.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating draft:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      result = data;
    } else {
      // Create new draft with required fields having default values
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          name: draftData.name || '',
          gender: draftData.gender || null,
          address_line_1: draftData.address_line_1 || '',
          address_line_2: draftData.address_line_2 || null,
          pin_code: draftData.pin_code || '',
          state: draftData.state || '',
          district: draftData.district || '',
          account_holder_name: draftData.account_holder_name || '',
          bank_account_number: draftData.bank_account_number || '',
          bank_name: draftData.bank_name || '',
          ifsc_code: draftData.ifsc_code || '',
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating draft:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json({ draft: result }, { status: 200 });
  } catch (error) {
    console.error('Error in draft POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customer-profiles/draft?leadId=xxx
 * Delete draft
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('customer_profiles')
      .delete()
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
      .eq('status', 'draft');

    if (error) {
      console.error('Error deleting draft:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in draft DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
