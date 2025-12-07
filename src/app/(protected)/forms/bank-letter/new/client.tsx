/**
 * Bank Letter Form Wrapper (Client Component)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BankLetterForm from '@/components/forms/BankLetterForm';
import type { BankLetterData } from '@/types/bank-letter';

interface BankLetterFormWrapperProps {
  leadId: string;
}

export function BankLetterFormWrapper({ leadId }: BankLetterFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: BankLetterData) => {
    setIsLoading(true);

    try {
      // Save bank letter form data to documents table
      const response = await fetch(`/api/leads/${leadId}/documents/bank-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form_data: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save bank letter');
      }
      
      alert('Bank letter saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating bank letter:', error);
      alert(error instanceof Error ? error.message : 'Failed to create bank letter');
    } finally {
      setIsLoading(false);
    }
  };

  return <BankLetterForm onSubmit={handleSubmit} />;
}
