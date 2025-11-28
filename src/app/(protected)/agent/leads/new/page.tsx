/**
 * Agent Create Lead Page
 * Form for agents to create new leads
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadFormWrapper } from './client';

export default async function AgentNewLeadPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/agent/leads"
            className="text-sm text-primary hover:text-primary/80 mb-4 inline-block transition-colors"
          >
            ← Back to My Leads
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Lead</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a new solar installation lead to the system
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <LeadFormWrapper />
        </div>
      </div>
    </div>
  );
}
