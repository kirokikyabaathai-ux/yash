/**
 * Agent Edit Lead Page
 * Form for agents to edit their leads
 */

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EditLeadClient } from './EditLeadClient';
import { auth } from '@/lib/auth/auth';

export default async function AgentEditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/');
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

  return <EditLeadClient lead={lead as any} leadId={id} />;
}
