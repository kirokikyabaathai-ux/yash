/**
 * Lead Form Component
 * 
 * Form for creating and editing leads with validation.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

'use client';

import { useState } from 'react';
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/types/api';
import type { LeadSource } from '@/types/database';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: CreateLeadRequest | UpdateLeadRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading = false }: LeadFormProps) {
  const [formData, setFormData] = useState({
    customer_name: lead?.customer_name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    address: lead?.address || '',
    kw_requirement: lead?.kw_requirement?.toString() || '',
    roof_type: lead?.roof_type || '',
    notes: lead?.notes || '',
    source: (lead?.source || 'agent') as LeadSource,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.kw_requirement && isNaN(Number(formData.kw_requirement))) {
      newErrors.kw_requirement = 'KW requirement must be a number';
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
      kw_requirement: formData.kw_requirement ? Number(formData.kw_requirement) : undefined,
      roof_type: formData.roof_type || undefined,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            disabled={isLoading}
            className={`mt-1 block w-full rounded-md border ${
              errors.customer_name ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.customer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="1234567890"
            autoComplete="tel"
            className={`mt-1 block w-full rounded-md border ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed touch-manipulation`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            inputMode="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="example@email.com"
            autoComplete="email"
            className={`mt-1 block w-full rounded-md border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed touch-manipulation`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* KW Requirement */}
        <div>
          <label htmlFor="kw_requirement" className="block text-sm font-medium text-gray-700">
            KW Requirement
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="kw_requirement"
            name="kw_requirement"
            value={formData.kw_requirement}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., 5.5"
            className={`mt-1 block w-full rounded-md border ${
              errors.kw_requirement ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed touch-manipulation`}
          />
          {errors.kw_requirement && (
            <p className="mt-1 text-sm text-red-600">{errors.kw_requirement}</p>
          )}
        </div>

        {/* Roof Type */}
        <div>
          <label htmlFor="roof_type" className="block text-sm font-medium text-gray-700">
            Roof Type
          </label>
          <select
            id="roof_type"
            name="roof_type"
            value={formData.roof_type}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select roof type</option>
            <option value="flat">Flat</option>
            <option value="sloped">Sloped</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Source (only for new leads) */}
        {!lead && (
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source <span className="text-red-500">*</span>
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="agent">Agent</option>
              <option value="office">Office</option>
              <option value="customer">Customer</option>
              <option value="self">Self</option>
            </select>
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className={`mt-1 block w-full rounded-md border ${
            errors.address ? 'border-red-300' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
