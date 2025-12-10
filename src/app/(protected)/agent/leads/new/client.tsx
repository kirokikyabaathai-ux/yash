/**
 * Lead Form Wrapper
 * Client component wrapper for creating new leads
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeadForm } from '@/components/leads/LeadForm';
import type { CreateLeadRequest } from '@/types/api';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function LeadFormWrapper() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string>('');

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
      toast.success('Lead created successfully!');
      
      // Show dialog to ask if user wants to fill customer form
      setCreatedLeadId(result.id);
      setShowConfirm(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead');
      throw error;
    }
  };

  const handleConfirmFillForm = () => {
    router.push(`/customer/profile/new?leadId=${createdLeadId}`);
  };

  const handleCancel = () => {
    router.push('/agent/leads');
  };

  return (
    <>
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        hideSource={true}
        defaultSource="agent"
      />
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={(open) => {
          setShowConfirm(open);
          if (!open && createdLeadId) {
            router.push(`/agent/leads/${createdLeadId}`);
          }
        }}
        title="Fill Customer Profile?"
        description="Would you like to fill the customer profile form now?"
        confirmText="Fill Form"
        cancelText="Later"
        onConfirm={handleConfirmFillForm}
      />
    </>
  );
}
