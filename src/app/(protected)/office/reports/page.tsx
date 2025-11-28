/**
 * Office Reports Page
 * Generate and view various reports
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OfficeReportsClient } from './client';

export default async function OfficeReportsPage() {
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

  if (!profile || profile.role !== 'office') {
    redirect('/login');
  }

  return <OfficeReportsClient />;
}
