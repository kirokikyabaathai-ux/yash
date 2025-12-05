/**
 * Customer Profile Form Wrapper (Client Component)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerProfileForm } from '@/components/customers/CustomerProfileForm';
import type { CustomerProfileFormData } from '@/types/customer';
import type { Lead } from '@/types/api';
import { getDashboardPath, type UserRole } from '@/lib/utils/navigation';

interface CustomerProfileFormWrapperProps {
  leadData?: Lead | null;
}

export function CustomerProfileFormWrapper({ leadData }: CustomerProfileFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: CustomerProfileFormData) => {
    setIsLoading(true);

    try {
      const leadId = data.lead_id || leadData?.id || '';
      
      // Get existing documents to check what's already uploaded
      const docsResponse = await fetch(`/api/documents?leadId=${leadId}`);
      const existingDocs: Record<string, any> = {};
      
      if (docsResponse.ok) {
        const { documents } = await docsResponse.json();
        documents.forEach((doc: any) => {
          existingDocs[doc.document_category] = doc;
        });
      }

      // Upload only new documents to Supabase Storage
      const documentPaths: Record<string, string> = {};
      const documentMetadata: Record<string, any> = {};
      
      const documentFields = [
        'aadhaar_front',
        'aadhaar_back',
        'electricity_bill',
        'bank_passbook',
        'cancelled_cheque',
        'pan_card',
        'itr_documents',
      ] as const;

      for (const field of documentFields) {
        const file = data[field];
        
        // Check if document already exists
        if (existingDocs[field]) {
          // Use existing document path
          documentPaths[`${field}_path`] = existingDocs[field].file_path;
          documentMetadata[field] = {
            fileName: existingDocs[field].file_name,
            fileSize: existingDocs[field].file_size,
            mimeType: existingDocs[field].mime_type,
          };
        } else if (file) {
          // Upload new file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('field', field);
          formData.append('leadId', leadId);

          const uploadResponse = await fetch('/api/customer-profiles/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${field}`);
          }

          const uploadData = await uploadResponse.json();
          documentPaths[`${field}_path`] = uploadData.path;
          documentMetadata[field] = {
            fileName: uploadData.fileName,
            fileSize: uploadData.fileSize,
            mimeType: uploadData.mimeType,
          };
        }
      }

      // Create customer profile
      const profileData = {
        user_id: data.user_id,
        lead_id: data.lead_id,
        name: data.name,
        gender: data.gender,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2,
        pin_code: data.pin_code,
        state: data.state,
        district: data.district,
        account_holder_name: data.account_holder_name,
        bank_account_number: data.bank_account_number,
        bank_name: data.bank_name,
        ifsc_code: data.ifsc_code,
        ...documentPaths,
        documentMetadata,
      };

      const response = await fetch('/api/customer-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer profile');
      }

      const result = await response.json();
      
      alert('Customer profile created successfully!');
      
      // Get session and redirect to role-based dashboard
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      const role = (session?.user?.role || 'customer') as UserRole;
      
      router.push(getDashboardPath(role));
      router.refresh();
    } catch (error) {
      console.error('Error creating customer profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to create customer profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <CustomerProfileForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      leadId={leadData?.id}
      leadData={leadData || undefined}
    />
  );
}
