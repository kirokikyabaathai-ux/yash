/**
 * New Customer Profile Page
 * 
 * Page for creating a new customer profile, optionally linked to a lead.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomerProfileFormWrapper } from './client';

interface PageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function NewCustomerProfilePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || !['customer', 'admin', 'office', 'agent'].includes(userData.role)) {
    redirect('/unauthorized');
  }

  // If leadId is provided, fetch lead data and check if profile already exists
  let leadData = null;
  if (params.leadId) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.leadId)
      .single();
    
    leadData = data;

    // Check if profile already exists for this lead
    const { data: existingProfile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('lead_id', params.leadId)
      .single();

    // If profile exists, redirect to view page (unless admin)
    if (existingProfile && userData.role !== 'admin') {
      redirect(`/customer/profile/${existingProfile.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create Customer Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in your details to complete your customer profile
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <CustomerProfileFormWrapper leadData={leadData as any} />
        </div>
      </div>
    </div>
  );
}
