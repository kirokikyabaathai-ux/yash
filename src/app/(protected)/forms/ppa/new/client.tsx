/**
 * PPA Form Wrapper (Client Component)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PPAForm from '@/components/forms/PPAForm';
import type { PPAData } from '@/types/ppa';
import { toast } from '@/lib/toast';

interface PPAFormWrapperProps {
  leadId: string;
}

export function PPAFormWrapper({ leadId }: PPAFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: PPAData) => {
    setIsLoading(true);

    try {
      // Save PPA form data to documents table
      const response = await fetch(`/api/leads/${leadId}/documents/ppa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form_data: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save PPA');
      }
      
      toast.success('PPA saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating PPA:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create PPA');
    } finally {
      setIsLoading(false);
    }
  };

  return <PPAForm onSubmit={handleSubmit} leadId={leadId} />;
}
