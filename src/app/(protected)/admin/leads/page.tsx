/**
 * Admin Leads List Page
 * Shows all leads with filtering and search
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminLeadsClient } from './client';
import { auth } from '@/lib/auth/auth';

export default async function AdminLeadsPage() {
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

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return <AdminLeadsClient />;
}
