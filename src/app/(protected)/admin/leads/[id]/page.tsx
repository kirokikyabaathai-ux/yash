/**
 * Admin Lead Detail Page
 * View and manage individual lead with full admin privileges
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadDetailClient } from '@/components/leads/LeadDetailClient';

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch lead data - admin can see all leads
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
    .single();

  if (leadError || !lead) {
    redirect('/admin/leads');
  }

  return (
    <div className="min-h-screen bg-background">
      <LeadDetailClient 
        lead={lead as any} 
        userRole="admin" 
        userId={user.id}
        backUrl="/admin/leads"
        backLabel="Back to All Leads"
      />
    </div>
  );
}
