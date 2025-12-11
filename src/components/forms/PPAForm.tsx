/**
 * PPA (Power Purchase Agreement) Form Component
 * Refactored to use Penpot Design System components
 * 
 * @validates Requirements 6.1, 6.2, 6.3, 9.4, 9.5
 */

import React, { useState, useEffect } from 'react';
import type { PPAData } from '@/types/ppa';
import { FormField } from '@/components/ui/molecules/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: PPAData) => void;
  initialData?: PPAData;
  leadId?: string;
}

const PPAForm: React.FC<Props> = ({ onSubmit, initialData, leadId }) => {
  
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
          
          if (lead && lead.customer_name) {
            setFormData(prev => ({ ...prev, prosumerName: lead.customer_name }));
            fieldsToDisable.add('prosumerName');
          }
        }

        // Fetch documents for profile and quotation data
        const docsResponse = await fetch(`/api/leads/${leadId}/documents`);
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          const documents = data.documents || data;
          const docsArray = Array.isArray(documents) ? documents : [];
          
          // Check for existing PPA document (for edit mode)
          const ppaDoc = docsArray.find((d: any) => d.document_category === 'ppa' && d.form_json);
          if (ppaDoc?.form_json) {
            const ppa = ppaDoc.form_json;
            // Load all PPA data for editing
            setFormData(prev => ({ ...prev, ...ppa }));
            // Don't disable fields when editing - allow changes
          } else {
            // Only pre-fill from profile and quotation if no existing PPA
            const profileDoc = docsArray.find((d: any) => d.document_category === 'profile' && d.form_json);
            if (profileDoc?.form_json) {
              const profile = profileDoc.form_json;
              const updates: Partial<PPAData> = {};
              
              if (profile.state) { updates.state = profile.state; fieldsToDisable.add('state'); }
              if (profile.district) { updates.district = profile.district; fieldsToDisable.add('district'); }
              if (profile.pin_code) { updates.pinCode = profile.pin_code; fieldsToDisable.add('pinCode'); }
              if (profile.address_line_1) { updates.village = profile.address_line_1; fieldsToDisable.add('village'); }
              if (profile.father_name) { updates.fatherName = profile.father_name; fieldsToDisable.add('fatherName'); }
              
              setFormData(prev => ({ ...prev, ...updates }));
            }
            
            // Get quotation data
            const quotationDoc = docsArray.find((d: any) => d.document_category === 'quotation' && d.form_json);
            if (quotationDoc?.form_json) {
              const quotation = quotationDoc.form_json;
              const updates: Partial<PPAData> = {};
              
              if (quotation.capacity) { updates.plantCapacity = quotation.capacity; fieldsToDisable.add('plantCapacity'); }
              if (quotation.consumerNumber) { updates.consumerId = quotation.consumerNumber; fieldsToDisable.add('consumerId'); }
              
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
                disabled={!isLoadingData && disabledFields.has('consumerId')}
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
                disabled={!isLoadingData && disabledFields.has('prosumerName')}
                required
              />
            </FormField>

            <FormField label="Father's Name" required>
              <Input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('fatherName')}
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
              disabled={!isLoadingData && disabledFields.has('village')}
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
                disabled={!isLoadingData && disabledFields.has('district')}
                required
              />
            </FormField>

            <FormField label="State" required>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isLoadingData && disabledFields.has('state')}
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
                disabled={!isLoadingData && disabledFields.has('pinCode')}
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
              disabled={!isLoadingData && disabledFields.has('plantCapacity')}
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
