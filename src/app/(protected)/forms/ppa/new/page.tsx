/**
 * PPA Form Page (Server Component)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { PPAFormWrapper } from './client';

interface PageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function PPAFormPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  const params = await searchParams;
  const leadId = params.leadId;

  if (!leadId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Lead ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PPAFormWrapper leadId={leadId} />
    </div>
  );
}
