/**
 * Office Reports Page
 * Generate and view various reports
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OfficeReportsClient } from './client';
import { auth } from '@/lib/auth/auth';

export default async function OfficeReportsPage() {
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

  return <OfficeReportsClient />;
}
