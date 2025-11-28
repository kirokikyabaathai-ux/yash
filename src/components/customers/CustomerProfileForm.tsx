/**
 * Customer Profile Form Component
 * 
 * Form for creating customer profiles with personal info, address, bank details, and documents.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomerProfileFormData, Gender } from '@/types/customer';
import type { Lead } from '@/types/api';

interface CustomerProfileFormProps {
  onSubmit: (data: CustomerProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  leadId?: string;
  leadData?: Lead;
}

export function CustomerProfileForm({ onSubmit, onCancel, isLoading = false, leadId, leadData }: CustomerProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CustomerProfileFormData>>({
    name: '',
    gender: undefined,
    address_line_1: '',
    address_line_2: '',
    pin_code: '',
    state: '',
    district: '',
    account_holder_name: '',
    bank_account_number: '',
    bank_name: '',
    ifsc_code: '',
    lead_id: leadId,
  });

  // Load draft and auto-fill form
  useEffect(() => {
    const loadDraft = async () => {
      if (leadId) {
        try {
          const response = await fetch(`/api/customer-profiles/draft?leadId=${leadId}`);
          if (response.ok) {
            const { draft } = await response.json();
            if (draft && draft.draft_data) {
              setFormData((prev) => ({
                ...prev,
                ...draft.draft_data,
              }));
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    };

    // Auto-fill form with lead data
    if (leadData) {
      setFormData((prev) => ({
        ...prev,
        name: leadData.customer_name || prev.name,
        lead_id: leadData.id,
      }));
    }

    loadDraft();
  }, [leadData, leadId]);

  const [files, setFiles] = useState<{
    aadhaar_front?: File;
    aadhaar_back?: File;
    electricity_bill?: File;
    bank_passbook?: File;
    cancelled_cheque?: File;
    pan_card?: File;
    itr_documents?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address_line_1?.trim()) {
      newErrors.address_line_1 = 'Address Line 1 is required';
    }

    if (!formData.pin_code?.trim()) {
      newErrors.pin_code = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'Pin code must be 6 digits';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.district?.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.account_holder_name?.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }

    if (!formData.bank_account_number?.trim()) {
      newErrors.bank_account_number = 'Bank account number is required';
    }

    if (!formData.bank_name?.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!formData.ifsc_code?.trim()) {
      newErrors.ifsc_code = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      newErrors.ifsc_code = 'Invalid IFSC code format';
    }

    // Document validation
    if (!files.aadhaar_front) {
      newErrors.aadhaar_front = 'Aadhaar front is required';
    }

    if (!files.aadhaar_back) {
      newErrors.aadhaar_back = 'Aadhaar back is required';
    }

    if (!files.electricity_bill) {
      newErrors.electricity_bill = 'Electricity bill is required';
    }

    if (!files.bank_passbook) {
      newErrors.bank_passbook = 'Bank passbook is required';
    }

    if (!files.cancelled_cheque) {
      newErrors.cancelled_cheque = 'Cancelled cheque is required';
    }

    if (!files.pan_card) {
      newErrors.pan_card = 'PAN card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: CustomerProfileFormData = {
      ...(formData as Required<Omit<CustomerProfileFormData, keyof typeof files>>),
      ...files,
    };

    await onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-gray-600">
        <span className="text-red-500">*</span> Indicates required fields
      </p>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address_line_1"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border ${
                errors.address_line_1 ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.address_line_1 && (
              <p className="mt-1 text-sm text-red-600">{errors.address_line_1}</p>
            )}
          </div>

          <div>
            <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              type="text"
              id="address_line_2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="pin_code" className="block text-sm font-medium text-gray-700">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="pin_code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={6}
                placeholder="123456"
                className={`mt-1 block w-full rounded-md border ${
                  errors.pin_code ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.pin_code && <p className="mt-1 text-sm text-red-600">{errors.pin_code}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={isLoading}
                className={`mt-1 block w-full rounded-md border ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={isLoading}
                className={`mt-1 block w-full rounded-md border ${
                  errors.district ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="account_holder_name" className="block text-sm font-medium text-gray-700">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="account_holder_name"
              name="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border ${
                errors.account_holder_name ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.account_holder_name && (
              <p className="mt-1 text-sm text-red-600">{errors.account_holder_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
              Bank Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="bank_account_number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border ${
                errors.bank_account_number ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.bank_account_number && (
              <p className="mt-1 text-sm text-red-600">{errors.bank_account_number}</p>
            )}
          </div>

          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border ${
                errors.bank_name ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.bank_name && <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>}
          </div>

          <div>
            <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ifsc_code"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={11}
              placeholder="ABCD0123456"
              className={`mt-1 block w-full rounded-md border ${
                errors.ifsc_code ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {errors.ifsc_code && <p className="mt-1 text-sm text-red-600">{errors.ifsc_code}</p>}
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="aadhaar_front" className="block text-sm font-medium text-gray-700">
              Aadhaar Card (Front) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="aadhaar_front"
              name="aadhaar_front"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.aadhaar_front ? 'border-red-300' : ''
              }`}
            />
            {errors.aadhaar_front && (
              <p className="mt-1 text-sm text-red-600">{errors.aadhaar_front}</p>
            )}
          </div>

          <div>
            <label htmlFor="aadhaar_back" className="block text-sm font-medium text-gray-700">
              Aadhaar Card (Back) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="aadhaar_back"
              name="aadhaar_back"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.aadhaar_back ? 'border-red-300' : ''
              }`}
            />
            {errors.aadhaar_back && (
              <p className="mt-1 text-sm text-red-600">{errors.aadhaar_back}</p>
            )}
          </div>

          <div>
            <label htmlFor="electricity_bill" className="block text-sm font-medium text-gray-700">
              Electricity Bill <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="electricity_bill"
              name="electricity_bill"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.electricity_bill ? 'border-red-300' : ''
              }`}
            />
            {errors.electricity_bill && (
              <p className="mt-1 text-sm text-red-600">{errors.electricity_bill}</p>
            )}
          </div>

          <div>
            <label htmlFor="bank_passbook" className="block text-sm font-medium text-gray-700">
              Bank Passbook <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="bank_passbook"
              name="bank_passbook"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.bank_passbook ? 'border-red-300' : ''
              }`}
            />
            {errors.bank_passbook && (
              <p className="mt-1 text-sm text-red-600">{errors.bank_passbook}</p>
            )}
          </div>

          <div>
            <label htmlFor="cancelled_cheque" className="block text-sm font-medium text-gray-700">
              Cancelled Cheque <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="cancelled_cheque"
              name="cancelled_cheque"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.cancelled_cheque ? 'border-red-300' : ''
              }`}
            />
            {errors.cancelled_cheque && (
              <p className="mt-1 text-sm text-red-600">{errors.cancelled_cheque}</p>
            )}
          </div>

          <div>
            <label htmlFor="pan_card" className="block text-sm font-medium text-gray-700">
              PAN Card <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="pan_card"
              name="pan_card"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                errors.pan_card ? 'border-red-300' : ''
              }`}
            />
            {errors.pan_card && <p className="mt-1 text-sm text-red-600">{errors.pan_card}</p>}
          </div>

          <div>
            <label htmlFor="itr_documents" className="block text-sm font-medium text-gray-700">
              ITR/Other Documents (Optional)
            </label>
            <input
              type="file"
              id="itr_documents"
              name="itr_documents"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*,.pdf"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={async () => {
              if (!leadId) {
                alert('Cannot save draft: No lead ID provided');
                return;
              }

              try {
                const response = await fetch('/api/customer-profiles/draft', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    leadId,
                    draftData: formData,
                  }),
                });

                if (response.ok) {
                  alert('Draft saved successfully! You can continue filling the form later.');
                  router.push('/customer/dashboard');
                } else {
                  const error = await response.json();
                  alert(`Failed to save draft: ${error.error || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Error saving draft:', error);
                alert('Failed to save draft. Please try again.');
              }
            }}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Customer Profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
