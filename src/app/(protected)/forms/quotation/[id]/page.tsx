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
    console.error('Quotation fetch error:', error);
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Quotation not found</p>
          {error && (
            <p className="text-sm text-red-600 mt-2">
              {error.message || 'Unknown error'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!document.form_json) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Error: No form data found in quotation</p>
        </div>
      </div>
    );
  }

  const quotationData = document.form_json as unknown as QuotationData;

  return (
    <div className="container mx-auto p-8">
      <QuotationView data={quotationData} />
    </div>
  );
}
