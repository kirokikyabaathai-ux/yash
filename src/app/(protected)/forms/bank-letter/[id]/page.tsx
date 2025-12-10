/**
 * Bank Letter View Page (Server Component)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';
import BankLetterView from '@/components/documents/BankLetterView';
import type { BankLetterData } from '@/types/bank-letter';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BankLetterViewPage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Fetch document from database
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('document_category', 'bank_letter')
    .single();

  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Bank letter document not found</p>
        </div>
      </div>
    );
  }

  const bankLetterData = document.form_json as unknown as BankLetterData;

  return (
    <div className="container mx-auto p-6">
      <BankLetterView data={bankLetterData} />
    </div>
  );
}
