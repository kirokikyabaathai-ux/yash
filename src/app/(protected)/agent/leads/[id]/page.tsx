/**
 * Agent Lead Detail Page
 * View and manage individual lead created by the agent
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadDetailClient } from '@/components/leads/LeadDetailClient';

export default async function AgentLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/login');
  }

  // Fetch lead data - RLS ensures agent can only see leads they created
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select(`
      *,
      created_by_user:users!created_by (
        id,
        name,
        email
      ),
      customer_account:users!customer_account_id (
        id,
        name,
        email,
        phone,
        customer_id
      ),
      installer:users!installer_id (
        id,
        name,
        phone
      )
    `)
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (leadError || !lead) {
    redirect('/agent/leads');
  }

  return (
    <div className="min-h-screen bg-background">
      <LeadDetailClient 
        lead={lead as any} 
        userRole="agent" 
        userId={user.id}
        backUrl="/agent/leads"
        backLabel="Back to My Leads"
      />
    </div>
  );
}
