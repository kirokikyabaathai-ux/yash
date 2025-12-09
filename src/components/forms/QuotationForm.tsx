/**
 * Quotation Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import { QuotationData } from '@/types/quotation';
import React, { useState } from 'react';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: QuotationData) => void;
}

const QuotationForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuotationData>({
    customerName: '',
    address: '',
    contactNo: '',
    applicationNumber: '',
    consumerNumber: '',
    date: '',
    quotationNo: '',
    capacity: '',
    siteLocation: '',
    areaCapacity: '',
    capacityKwp: '',
    pvQuantity: '',
    systemCost: '',
    subsidyAmount: '',
    netMeteringIncluded: '',
    totalCost: '',
    amountInWords: '',
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
      <h2 className="text-2xl font-bold mb-6 text-[var(--penpot-success)] border-b pb-2">
        Create New Quotation
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Customer Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Customer Name" required>
              <Input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Contact No." required>
              <Input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <FormField label="Address" required>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        {/* Application Details Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Application Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Application Number" required>
              <Input
                type="text"
                name="applicationNumber"
                value={formData.applicationNumber}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Consumer Number" required>
              <Input
                type="text"
                name="consumerNumber"
                value={formData.consumerNumber}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Date of Proposal" required>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Proposal Quotation No." required>
              <Input
                type="text"
                name="quotationNo"
                value={formData.quotationNo}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>
        </div>

        {/* Technical & Site Specs Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Technical & Site Specs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Proposed Capacity (KWP)" required>
              <Input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Site Location" required>
              <Input
                type="text"
                name="siteLocation"
                value={formData.siteLocation}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Area Wise Capacity (Header)" required>
              <Input
                type="text"
                name="areaCapacity"
                value={formData.areaCapacity}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Capacity (Table Column)" required>
              <Input
                type="text"
                name="capacityKwp"
                value={formData.capacityKwp}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="PV Modules Quantity" required>
              <Input
                type="text"
                name="pvQuantity"
                value={formData.pvQuantity}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>
        </div>

        {/* Commercials Section */}
        <div className="space-y-4">
          <h3 className="bg-[var(--penpot-bg-gray-50)] p-3 rounded-[8px] font-semibold text-[var(--penpot-neutral-dark)]">
            Commercials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Supply Cost (Base System)" required>
              <Input
                type="text"
                name="systemCost"
                value={formData.systemCost}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Subsidy Amount" required>
              <Input
                type="text"
                name="subsidyAmount"
                value={formData.subsidyAmount}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Net Metering Status" required>
              <Input
                type="text"
                name="netMeteringIncluded"
                value={formData.netMeteringIncluded}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Total System Cost Paid by Client" required>
              <Input
                type="text"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <FormField label="Total Amount in Words" required>
            <Input
              type="text"
              name="amountInWords"
              value={formData.amountInWords}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" variant="primary" colorScheme="green" size="lg" fullWidth>
            Generate Quotation
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuotationForm;