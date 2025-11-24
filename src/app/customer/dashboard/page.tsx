/**
 * Customer Dashboard Page
 * 
 * Displays the customer's linked lead information, timeline, and document upload options.
 * Requirements: 3.5
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomerDashboardContent } from '@/components/customer/CustomerDashboardContent';

export default async function CustomerDashboardPage() {
  const supabase = await createClient();

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/login');
  }

  // Verify user is a customer
  if (profile.role !== 'customer') {
    redirect('/login');
  }

  // Get the customer's linked lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('customer_account_id', user.id)
    .single();

  // Get timeline steps if lead exists
  let timelineSteps = null;
  if (lead) {
    const { data: steps } = await supabase
      .from('lead_steps')
      .select(`
        *,
        step_master:step_id (
          id,
          step_name,
          order_index,
          allowed_roles,
          remarks_required,
          attachments_allowed,
          customer_upload
        ),
        completed_by_user:completed_by (
          id,
          name
        )
      `)
      .eq('lead_id', lead.id)
      .order('step_master(order_index)', { ascending: true });

    timelineSteps = steps;
  }

  // Get documents if lead exists
  let documents = null;
  if (lead) {
    const { data: docs } = await supabase
      .from('documents')
      .select(`
        *,
        uploaded_by_user:uploaded_by (
          id,
          name
        )
      `)
      .eq('lead_id', lead.id)
      .order('uploaded_at', { ascending: false });

    documents = docs;
  }

  return (
    <CustomerDashboardContent
      user={profile}
      lead={lead}
      timelineSteps={timelineSteps}
      documents={documents}
    />
  );
}
