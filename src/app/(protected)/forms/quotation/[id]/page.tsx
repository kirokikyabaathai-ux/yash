/**
 * Quotation View Page (Server Component)
 */

import { createClient } from '@/lib/supabase/server';
import QuotationView from '@/components/documents/QuotationView';
import type { QuotationData } from '@/types/quotation';

export default async function QuotationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch quotation document
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('document_category', 'quotation')
    .single();

  if (error || !document) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Quotation not found</p>
        </div>
      </div>
    );
  }

  const quotationData = document.form_json as QuotationData;

  return (
    <div className="container mx-auto p-8">
      <QuotationView data={quotationData} />
    </div>
  );
}
