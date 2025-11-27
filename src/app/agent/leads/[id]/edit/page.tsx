/**
 * Agent Edit Lead Page
 * Form for agents to edit their leads
 */

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EditLeadClient } from './EditLeadClient';

export default async function AgentEditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

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

  // Fetch lead (RLS ensures agent can only access their own leads)
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadError || !lead) {
    notFound();
  }

  return <EditLeadClient lead={lead} leadId={id} />;
}
