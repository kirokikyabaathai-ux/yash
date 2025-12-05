/**
 * Lead Form Component
 * 
 * Form for creating and editing leads with validation.
 * 
 * Requirements: 2.1, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4
 */

'use client';

import { useState } from 'react';
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/types/api';
import type { LeadSource } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: CreateLeadRequest | UpdateLeadRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  hideSource?: boolean;
  defaultSource?: LeadSource;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading = false, hideSource = false, defaultSource = 'agent' }: LeadFormProps) {
  const [formData, setFormData] = useState({
    customer_name: lead?.customer_name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    address: lead?.address || '',
    notes: lead?.notes || '',
    source: (lead?.source || defaultSource) as LeadSource,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[1-9][0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits and cannot start with 0';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CreateLeadRequest | UpdateLeadRequest = {
      customer_name: formData.customer_name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address,
      notes: formData.notes || undefined,
      ...(!lead && { source: formData.source }),
    };

    await onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> Indicates necessary fields
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <FormField
          label="Customer Name"
          required
          error={errors.customer_name}
          htmlFor="customer_name"
        >
          <Input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </FormField>

        {/* Phone */}
        <FormField
          label="Phone Number"
          required
          error={errors.phone}
          htmlFor="phone"
          helpText="10 digits, cannot start with 0"
        >
          <Input
            type="tel"
            inputMode="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="9876543210"
            autoComplete="tel"
          />
        </FormField>

        {/* Email */}
        <FormField
          label="Email"
          error={errors.email}
          htmlFor="email"
        >
          <Input
            type="email"
            inputMode="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="example@email.com"
            autoComplete="email"
          />
        </FormField>

        {/* Source (only for new leads and when not hidden) */}
        {!lead && !hideSource && (
          <FormField
            label="Source"
            required
            htmlFor="source"
          >
            <Select
              value={formData.source}
              onValueChange={(value) => handleChange({ target: { name: 'source', value } } as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="self">Self</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      </div>

      {/* Address */}
      <FormField
        label="Address"
        required
        error={errors.address}
        htmlFor="address"
      >
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
        />
      </FormField>

      {/* Notes */}
      <FormField
        label="Notes"
        htmlFor="notes"
      >
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={4}
        />
      </FormField>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
