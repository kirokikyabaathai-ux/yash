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

  // Try to fetch from documents table first (new format)
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('document_category', 'profile')
    .single() as any;

  let profile = null;

  if (document?.form_json) {
    // Convert document format to profile format
    profile = {
      id: document.id,
      ...document.form_json,
      created_at: document.uploaded_at,
      updated_at: document.updated_at,
      status: document.is_submitted ? 'submitted' : 'draft',
    };
  } else {
    // Fallback to customer_profiles table (old format)
    const { data: oldProfile, error: profileError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !oldProfile) {
      redirect('/office/dashboard');
    }

    profile = oldProfile;
  }

  if (!profile) {
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
