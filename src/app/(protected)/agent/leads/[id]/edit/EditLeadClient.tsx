/**
 * Edit Lead Client Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeadForm } from '@/components/leads/LeadForm';
import type { Lead, UpdateLeadRequest } from '@/types/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/organisms/Card';

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="Edit Lead"
          description={`Update lead information for ${lead.customer_name}`}
          breadcrumbs={[
            { label: 'My Leads', href: '/agent/leads' },
            { label: lead.customer_name, href: `/agent/leads/${leadId}` },
            { label: 'Edit' },
          ]}
        >
          <Card padding="lg">
            <LeadForm
              lead={lead}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
