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

    // Get draft
    const { data: draft, error } = await supabase
      .from('customer_profile_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
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
 * Save or update draft
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

    // Check if draft exists
    const { data: existingDraft } = await supabase
      .from('customer_profile_drafts')
      .select('id')
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
      .single();

    let result;

    if (existingDraft) {
      // Update existing draft
      const { data, error } = await supabase
        .from('customer_profile_drafts')
        .update({
          draft_data: draftData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating draft:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      result = data;
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from('customer_profile_drafts')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          draft_data: draftData,
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
      .from('customer_profile_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('lead_id', leadId);

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
