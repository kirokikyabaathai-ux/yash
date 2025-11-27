/**
 * Customer Profiles API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Determine the correct user_id
    let targetUserId = body.user_id || user.id;
    
    // If a lead_id is provided and user_id is not explicitly set, 
    // use the customer_account_id from the lead (if it exists)
    if (body.lead_id && !body.user_id) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('customer_account_id')
        .eq('id', body.lead_id)
        .single();
      
      if (leadData?.customer_account_id) {
        targetUserId = leadData.customer_account_id;
      }
    }

    // Ensure timeline exists for the lead
    if (body.lead_id) {
      try {
        // Check if timeline already exists
        const { data: existingSteps } = await supabase
          .from('lead_steps')
          .select('id')
          .eq('lead_id', body.lead_id)
          .limit(1);

        // If no steps exist, initialize the timeline
        if (!existingSteps || existingSteps.length === 0) {
          const { error: timelineError } = await supabase.rpc('initialize_lead_timeline', {
            p_lead_id: body.lead_id,
          });

          if (timelineError) {
            console.error('Failed to initialize timeline:', timelineError);
            // Don't fail the request, just log the error
          }
        }
      } catch (timelineErr) {
        console.error('Error checking/initializing timeline:', timelineErr);
        // Don't fail the request
      }
    }

    // Insert customer profile
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert({
        user_id: targetUserId,
        lead_id: body.lead_id,
        name: body.name,
        gender: body.gender,
        address_line_1: body.address_line_1,
        address_line_2: body.address_line_2,
        pin_code: body.pin_code,
        state: body.state,
        district: body.district,
        account_holder_name: body.account_holder_name,
        bank_account_number: body.bank_account_number,
        bank_name: body.bank_name,
        ifsc_code: body.ifsc_code,
        aadhaar_front_path: body.aadhaar_front_path,
        aadhaar_back_path: body.aadhaar_back_path,
        electricity_bill_path: body.electricity_bill_path,
        bank_passbook_path: body.bank_passbook_path,
        cancelled_cheque_path: body.cancelled_cheque_path,
        pan_card_path: body.pan_card_path,
        itr_documents_path: body.itr_documents_path,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create document records for uploaded files
    const documentMappings = [
      { field: 'aadhaar_front', pathField: 'aadhaar_front_path', category: 'aadhar_front' },
      { field: 'aadhaar_back', pathField: 'aadhaar_back_path', category: 'aadhar_back' },
      { field: 'electricity_bill', pathField: 'electricity_bill_path', category: 'bijli_bill' },
      { field: 'bank_passbook', pathField: 'bank_passbook_path', category: 'bank_passbook' },
      { field: 'cancelled_cheque', pathField: 'cancelled_cheque_path', category: 'cancelled_cheque' },
      { field: 'pan_card', pathField: 'pan_card_path', category: 'pan_card' },
      { field: 'itr_documents', pathField: 'itr_documents_path', category: 'itr' },
    ];

    const documentInserts = [];
    const metadata = body.documentMetadata || {};
    
    for (const mapping of documentMappings) {
      const filePath = body[mapping.pathField];
      if (filePath) {
        const fileMetadata = metadata[mapping.field] || {};
        
        documentInserts.push({
          lead_id: body.lead_id,
          type: 'mandatory' as const,
          document_category: mapping.category,
          file_path: filePath,
          file_name: fileMetadata.fileName || filePath.split('/').pop(),
          file_size: fileMetadata.fileSize || 0,
          mime_type: fileMetadata.mimeType || 'application/octet-stream',
          uploaded_by: user.id,
          status: 'valid' as const,
        });
      }
    }

    if (documentInserts.length > 0) {
      const { error: docError } = await supabase
        .from('documents')
        .insert(documentInserts);

      if (docError) {
        console.error('Error creating document records:', docError);
        // Don't fail the whole request, just log the error
      }
    }

    // Update lead status to 'lead_processing' if it's still in 'lead' or 'lead_interested' status
    if (body.lead_id) {
      try {
        const { data: leadData } = await supabase
          .from('leads')
          .select('status')
          .eq('id', body.lead_id)
          .single();

        if (leadData && (leadData.status === 'lead' || leadData.status === 'lead_interested')) {
          await supabase
            .from('leads')
            .update({ 
              status: 'lead_processing' as const,
              updated_at: new Date().toISOString()
            })
            .eq('id', body.lead_id);
        }
      } catch (statusErr) {
        console.error('Error updating lead status:', statusErr);
        // Don't fail the request
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in customer profiles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    let query = supabase.from('customer_profiles').select('*');

    if (leadId) {
      query = query.eq('lead_id', leadId);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customer profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in customer profiles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
