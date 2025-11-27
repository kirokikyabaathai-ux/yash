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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/agent/leads"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to My Leads
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new solar installation lead to the system
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <LeadFormWrapper />
        </div>
      </div>
    </div>
  );
}
