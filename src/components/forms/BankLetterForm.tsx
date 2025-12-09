/**
 * Bank Letter Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import React, { useState } from 'react';
import type { BankLetterData } from '@/types/bank-letter';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: BankLetterData) => void;
  initialData?: BankLetterData;
}

const BankLetterForm: React.FC<Props> = ({ onSubmit, initialData }) => {
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
                required
              />
            </FormField>

            <FormField label="Solar Capacity" required>
              <Input
                type="text"
                name="solarCapacity"
                value={formData.solarCapacity}
                onChange={handleChange}
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
                required
              />
            </FormField>

            <FormField label="State & Pin Code" required>
              <Input
                type="text"
                name="stateAndPin"
                value={formData.stateAndPin}
                onChange={handleChange}
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
