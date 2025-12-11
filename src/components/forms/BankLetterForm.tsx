/**
 * Bank Letter Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import React, { useState, useEffect } from 'react';
import type { BankLetterData } from '@/types/bank-letter';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: BankLetterData) => void;
  initialData?: BankLetterData;
  leadId?: string;
}

const BankLetterForm: React.FC<Props> = ({ onSubmit, initialData, leadId }) => {
  
  const [formData, setFormData] = useState<BankLetterData>(initialData || {
    date: new Date().toLocaleDateString('en-GB'),
    bankName: '',
    bankAddress: '',
    applicantName: '',
    solarCapacity: '',
    bpNumber: '',
    applicantAddress: '',
    district: '',
    stateAndPin: '',
    mobileNumber: '',
  });
  
  const [disabledFields, setDisabledFields] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Pre-fill data from lead and existing documents
  useEffect(() => {
    const fetchPreFillData = async () => {
      if (!leadId) {
        setIsLoadingData(false);
        return;
      }

      const fieldsToDisable = new Set<string>();

      try {
        // Fetch lead data
        const leadResponse = await fetch(`/api/leads/${leadId}`);
        if (leadResponse.ok) {
          const data = await leadResponse.json();
          const lead = data.lead || data;
          
          if (lead) {
            const updates: Partial<BankLetterData> = {};
            
            if (lead.customer_name) { updates.applicantName = lead.customer_name; fieldsToDisable.add('applicantName'); }
            if (lead.phone) { updates.mobileNumber = lead.phone; fieldsToDisable.add('mobileNumber'); }
            if (lead.address) { updates.applicantAddress = lead.address; fieldsToDisable.add('applicantAddress'); }
            
            setFormData(prev => ({ ...prev, ...updates }));
          }
        }

        // Fetch documents for profile and quotation data
        const docsResponse = await fetch(`/api/leads/${leadId}/documents`);
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          const documents = data.documents || data;
          const docsArray = Array.isArray(documents) ? documents : [];
          
          // Check for existing Bank Letter document (for edit mode)
          const bankLetterDoc = docsArray.find((d: any) => d.document_category === 'bank_letter' && d.form_json);
          if (bankLetterDoc?.form_json) {
            const bankLetter = bankLetterDoc.form_json;
            // Load all Bank Letter data for editing
            setFormData(prev => ({ ...prev, ...bankLetter }));
            // Don't disable fields when editing - allow changes
          } else {
            // Only pre-fill from profile and quotation if no existing Bank Letter
            const profileDoc = docsArray.find((d: any) => d.document_category === 'profile' && d.form_json);
            if (profileDoc?.form_json) {
              const profile = profileDoc.form_json;
              const updates: Partial<BankLetterData> = {};
              
              if (profile.district) { updates.district = profile.district; fieldsToDisable.add('district'); }
              if (profile.state) { updates.stateAndPin = profile.state; fieldsToDisable.add('stateAndPin'); }
              
              // Combine bank_name and branch_name for bankName field
              if (profile.bank_name) {
                const bankNameWithBranch = profile.branch_name 
                  ? `${profile.bank_name} ${profile.branch_name}`
                  : profile.bank_name;
                updates.bankName = bankNameWithBranch;
                fieldsToDisable.add('bankName');
              }
              
              if (profile.bank_address) { updates.bankAddress = profile.bank_address; fieldsToDisable.add('bankAddress'); }
              
              setFormData(prev => ({ ...prev, ...updates }));
            }
            
            // Get quotation data
            const quotationDoc = docsArray.find((d: any) => d.document_category === 'quotation' && d.form_json);
            if (quotationDoc?.form_json) {
              const quotation = quotationDoc.form_json;
              const updates: Partial<BankLetterData> = {};
              
              if (quotation.capacity) { updates.solarCapacity = quotation.capacity; fieldsToDisable.add('solarCapacity'); }
              if (quotation.consumerNumber) { updates.bpNumber = quotation.consumerNumber; fieldsToDisable.add('bpNumber'); }
              
              setFormData(prev => ({ ...prev, ...updates }));
            }
          }
        }
        
        setDisabledFields(fieldsToDisable);
      } catch (error) {
        console.error('Error fetching pre-fill data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPreFillData();
  }, [leadId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-[var(--penpot-primary)] border-b pb-2">
        Bank Letter - Work Completion & Payment Request
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Letter Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Letter Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" required>
              <Input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
                required
              />
            </FormField>

            <FormField label="BP Number" required>
              <Input
                type="text"
                name="bpNumber"
                value={formData.bpNumber}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('bpNumber')}
                placeholder="1006637898"
                required
              />
            </FormField>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Bank Details
          </h3>

          <FormField label="Bank Name & Branch" required className="md:col-span-2">
            <Input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              disabled={!isLoadingData && disabledFields.has('bankName')}
              placeholder="The SBI MEDICAL COLLEGE (RAIGARH)"
              required
            />
          </FormField>

          <FormField label="Bank Address / City" required className="md:col-span-2">
            <Input
              type="text"
              name="bankAddress"
              value={formData.bankAddress}
              onChange={handleChange}
              disabled={!isLoadingData && disabledFields.has('bankAddress')}
              placeholder="SBI Raigarh Dist - Raigarh (C.G.) 496001"
              required
            />
          </FormField>
        </div>

        {/* Applicant Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Applicant Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Applicant Name" required>
              <Input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('applicantName')}
                required
              />
            </FormField>

            <FormField label="Solar Capacity" required>
              <Input
                type="text"
                name="solarCapacity"
                value={formData.solarCapacity}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('solarCapacity')}
                placeholder="3kw"
                required
              />
            </FormField>
          </div>

          <FormField label="Applicant Address" required>
            <Input
              type="text"
              name="applicantAddress"
              value={formData.applicantAddress}
              onChange={handleChange}
              disabled={!isLoadingData && disabledFields.has('applicantAddress')}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="District" required>
              <Input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('district')}
                required
              />
            </FormField>

            <FormField label="State & Pin Code" required>
              <Input
                type="text"
                name="stateAndPin"
                value={formData.stateAndPin}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('stateAndPin')}
                placeholder="Chhattisgarh. 496001"
                required
              />
            </FormField>
          </div>

          <FormField label="Mobile Number" required>
            <Input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              disabled={!isLoadingData && disabledFields.has('mobileNumber')}
              pattern="[0-9]{10}"
              placeholder="9753265945"
              required
            />
          </FormField>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Save Bank Letter
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BankLetterForm;
