/**
 * Quotation Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import { QuotationData } from '@/types/quotation';
import React, { useState, useEffect } from 'react';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  onSubmit: (data: QuotationData) => void;
  leadId?: string;
}

const QuotationForm: React.FC<Props> = ({ onSubmit, leadId }) => {
  
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
            const updates: Partial<QuotationData> = {};
            
            if (lead.customer_name) { updates.customerName = lead.customer_name; fieldsToDisable.add('customerName'); }
            if (lead.phone) { updates.contactNo = lead.phone; fieldsToDisable.add('contactNo'); }
            if (lead.address) { updates.address = lead.address; fieldsToDisable.add('address'); }
            
            setFormData(prev => ({ ...prev, ...updates }));
          }
        }

        // Fetch documents for profile and existing quotation data
        const docsResponse = await fetch(`/api/leads/${leadId}/documents`);
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          const documents = data.documents || data;
          const docsArray = Array.isArray(documents) ? documents : [];
          
          // Check for existing quotation document (for edit mode)
          const quotationDoc = docsArray.find((d: any) => d.document_category === 'quotation' && d.form_json);
          if (quotationDoc?.form_json) {
            const quotation = quotationDoc.form_json;
            // Load all quotation data for editing
            setFormData(prev => ({ ...prev, ...quotation }));
            // Don't disable fields when editing - allow changes
          } else {
            // Only pre-fill from profile if no existing quotation
            const profileDoc = docsArray.find((d: any) => d.document_category === 'profile' && d.form_json);
            if (profileDoc?.form_json) {
              const profile = profileDoc.form_json;
              if (profile.address_line_1 && profile.district) {
                setFormData(prev => ({
                  ...prev,
                  siteLocation: `${profile.address_line_1}, ${profile.district}`,
                }));
                fieldsToDisable.add('siteLocation');
              }
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-[var(--penpot-primary-dark)] border-b pb-2">
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
                disabled={!isLoadingData && disabledFields.has('customerName')}
                required
              />
            </FormField>

            <FormField label="Contact No." required>
              <Input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('contactNo')}
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
              disabled={!isLoadingData && disabledFields.has('address')}
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
                disabled={!isLoadingData && disabledFields.has('siteLocation')}
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
                type="number"
                name="systemCost"
                value={formData.systemCost}
                onChange={handleChange}
                placeholder="Enter amount in ₹"
                required
              />
            </FormField>

            <FormField label="Subsidy Amount" required>
              <Input
                type="number"
                name="subsidyAmount"
                value={formData.subsidyAmount}
                onChange={handleChange}
                placeholder="Enter amount in ₹"
                required
              />
            </FormField>

            <FormField label="Net Metering Status" required>
              <Select
                value={formData.netMeteringIncluded}
                onValueChange={(value) => handleSelectChange('netMeteringIncluded', value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select net metering status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCLUDED">Included</SelectItem>
                  <SelectItem value="NOT_INCLUDED">Not Included</SelectItem>
                  <SelectItem value="EXTRA_CHARGES">Extra Charges Apply</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
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