/**
 * Office Leads List Page
 * Shows all leads with filtering and search
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OfficeLeadsClient } from './client';

export default async function OfficeLeadsPage() {
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

  if (!profile || profile.role !== 'office') {
    redirect('/');
  }

  return <OfficeLeadsClient />;
}
