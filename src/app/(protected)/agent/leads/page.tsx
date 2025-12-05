/**
 * Agent Leads List Page
 * Shows all leads assigned to the agent with filtering and search
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AgentLeadsClient } from './client';
import { auth } from '@/lib/auth/auth';

export default async function AgentLeadsPage() {
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

  return <AgentLeadsClient />;
}
