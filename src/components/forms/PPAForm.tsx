/**
 * PPA (Power Purchase Agreement) Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import React, { useState } from 'react';
import type { PPAData } from '@/types/ppa';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: PPAData) => void;
  initialData?: PPAData;
}

const PPAForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<PPAData>(initialData || {
    agreementDate: '',
    consumerId: '',
    prosumerName: '',
    fatherName: '',
    village: '',
    district: '',
    state: '',
    pinCode: '',
    plantCapacity: '',
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
        Power Purchase Agreement (PPA) - RTS Plants
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agreement Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Agreement Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Agreement Date" required>
              <Input
                type="date"
                name="agreementDate"
                value={formData.agreementDate}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Consumer ID / BP No" required>
              <Input
                type="text"
                name="consumerId"
                value={formData.consumerId}
                onChange={handleChange}
                placeholder="e.g., 1002794244"
                required
              />
            </FormField>
          </div>
        </div>

        {/* Prosumer Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Prosumer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Prosumer Name" required>
              <Input
                type="text"
                name="prosumerName"
                value={formData.prosumerName}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Father's Name" required>
              <Input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Shree..."
                required
              />
            </FormField>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Address Details
          </h3>

          <FormField label="Village / Address Line 1" required>
            <Input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="Vill. Tangarghat"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="District" required>
              <Input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="State" required>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CHHATTISGARH"
                required
              />
            </FormField>

            <FormField label="PIN Code" required>
              <Input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                placeholder="496107"
                required
              />
            </FormField>
          </div>
        </div>

        {/* Plant Specifications Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Plant Specifications
          </h3>

          <FormField label="Plant Capacity (kWp)" required>
            <Input
              type="number"
              name="plantCapacity"
              value={formData.plantCapacity}
              onChange={handleChange}
              placeholder="3.00"
              step="0.01"
              required
            />
          </FormField>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Save PPA Agreement
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PPAForm;
