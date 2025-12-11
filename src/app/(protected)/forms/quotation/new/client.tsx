/**
 * Quotation Form Wrapper (Client Component)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuotationForm from '@/components/forms/QuotationForm';
import type { QuotationData } from '@/types/quotation';
import { toast } from '@/lib/toast';

interface QuotationFormWrapperProps {
  leadId: string;
}

export function QuotationFormWrapper({ leadId }: QuotationFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: QuotationData) => {
    setIsLoading(true);

    try {
      // Save quotation form data to documents table
      const response = await fetch(`/api/leads/${leadId}/documents/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form_data: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save quotation');
      }
      
      toast.success('Quotation saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create quotation');
    } finally {
      setIsLoading(false);
    }
  };

  return <QuotationForm onSubmit={handleSubmit} leadId={leadId} />;
}
