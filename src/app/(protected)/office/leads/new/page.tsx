/**
 * Office Create New Lead Page
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadFormWrapper } from './client';
import { auth } from '@/lib/auth/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/organisms/Card';

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
        <PageLayout
          title="Create New Lead"
          description="Add a new solar installation lead to the system"
          breadcrumbs={[
            { label: 'Leads', href: '/office/leads' },
            { label: 'New Lead' },
          ]}
        >
          <Card padding="lg">
            <LeadFormWrapper />
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
