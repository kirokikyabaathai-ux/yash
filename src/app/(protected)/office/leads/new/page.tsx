/**
 * Office Create New Lead Page
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadFormWrapper } from './client';
import { auth } from '@/lib/auth/auth';

export default async function OfficeNewLeadPage() {
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

  if (!profile || profile.role !== 'office') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
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
