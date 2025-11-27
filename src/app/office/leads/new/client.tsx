/**
 * Lead Form Wrapper
 * Client component wrapper for creating new leads from office
 */

'use client';

import { useRouter } from 'next/navigation';
import { LeadForm } from '@/components/leads/LeadForm';
import type { CreateLeadRequest } from '@/types/api';

export function LeadFormWrapper() {
  const router = useRouter();

  const handleSubmit = async (data: CreateLeadRequest | any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create lead');
      }

      const result = await response.json();
      
      // Ask user if they want to fill customer form now
      const fillForm = confirm(
        'Lead created successfully!\n\nWould you like to fill the customer profile form now?'
      );
      
      if (fillForm) {
        router.push(`/customer/profile/new?leadId=${result.id}`);
      } else {
        router.push(`/office/leads/${result.id}`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create lead');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/office/leads');
  };

  return (
    <LeadForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      defaultSource="office"
    />
  );
}
