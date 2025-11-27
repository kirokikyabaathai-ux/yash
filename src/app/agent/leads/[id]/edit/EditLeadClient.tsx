/**
 * Edit Lead Client Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeadForm } from '@/components/leads/LeadForm';
import type { Lead, UpdateLeadRequest } from '@/types/api';

interface EditLeadClientProps {
  lead: Lead;
  leadId: string;
}

export function EditLeadClient({ lead, leadId }: EditLeadClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UpdateLeadRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      router.push(`/agent/leads/${leadId}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/agent/leads/${leadId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/agent/leads/${leadId}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Lead Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update lead information for {lead.customer_name}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <LeadForm
            lead={lead}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
