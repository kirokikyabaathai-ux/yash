/**
 * Customer Profile View Page
 * Shows submitted customer profile (read-only unless admin)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomerProfileView } from '@/components/customers/CustomerProfileView';
import { auth } from '@/lib/auth/auth';

export default async function CustomerProfileViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/');
  }

  const supabase = await createClient();

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!userData) {
    redirect('/');
  }

  // Fetch customer profile
  const { data: profile, error: profileError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    redirect('/office/dashboard');
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerProfileView profile={profile as any} userRole={userData.role} />
      </div>
    </div>
  );
}
