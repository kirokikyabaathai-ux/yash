/**
 * Agent Leads List Page
 * Shows all leads assigned to the agent with filtering and search
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentLeadsClient } from './client';

export default async function AgentLeadsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/');
  }

  return <AgentLeadsClient />;
}
