/**
 * Customer Dashboard Page
 * 
 * Displays the customer's linked lead information, timeline, and document upload options.
 * Requirements: 3.5
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomerDashboardContent } from '@/components/customer/CustomerDashboardContent';
import { auth } from '@/lib/auth/auth';

export default async function CustomerDashboardPage() {
  // Get the current session using NextAuth
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  // createClient() automatically handles Supabase Auth session
  // It reads cookies OR restores from NextAuth tokens
  // RLS policies will work correctly
  const supabase = await createClient();

  // Get user profile from Supabase using session user ID
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    redirect('/');
  }

  // Verify user is a customer
  if (profile.role !== 'customer') {
    redirect('/');
  }

  // Get the customer's linked lead (filtered by user ID for security)
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      *,
      customer_account:users!customer_account_id (
        customer_id
      )
    `)
    .eq('customer_account_id', session.user.id)
    .maybeSingle();

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
      lead={lead as any}
      timelineSteps={timelineSteps as any}
      documents={documents as any}
    />
  );
}
