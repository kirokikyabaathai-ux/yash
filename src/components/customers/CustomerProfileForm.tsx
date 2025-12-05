/**
 * Customer Profile Form Component
 * 
 * Form for creating customer profiles with personal info, address, bank details, and documents.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomerProfileFormData } from '@/types/customer';
import type { Lead } from '@/types/api';
import { getDashboardPath, type UserRole } from '@/lib/utils/navigation';

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

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load draft, documents, and auto-fill form
  useEffect(() => {
    const loadData = async () => {
      if (leadId) {
        try {
          // Load draft
          const draftResponse = await fetch(`/api/customer-profiles/draft?leadId=${leadId}`);
          if (draftResponse.ok) {
            const { draft } = await draftResponse.json();
            if (draft) {
              // Check if already submitted
              if (draft.status === 'submitted') {
                setIsSubmitted(true);
              }
              
              setFormData((prev) => ({
                ...prev,
                name: draft.name || prev.name,
                gender: draft.gender || prev.gender,
                address_line_1: draft.address_line_1 || prev.address_line_1,
                address_line_2: draft.address_line_2 || prev.address_line_2,
                pin_code: draft.pin_code || prev.pin_code,
                state: draft.state || prev.state,
                district: draft.district || prev.district,
                account_holder_name: draft.account_holder_name || prev.account_holder_name,
                bank_account_number: draft.bank_account_number || prev.bank_account_number,
                bank_name: draft.bank_name || prev.bank_name,
                ifsc_code: draft.ifsc_code || prev.ifsc_code,
              }));
            }
          }

          // Load existing documents
          const docsResponse = await fetch(`/api/documents?leadId=${leadId}`);
          if (docsResponse.ok) {
            const { documents } = await docsResponse.json();
            console.log('Loaded documents:', documents);
            const docsMap: Record<string, { url: string; name: string; id: string }> = {};
            documents.forEach((doc: any) => {
              docsMap[doc.document_category] = {
                url: doc.public_url,
                name: doc.file_name,
                id: doc.id,
              };
            });
            console.log('Documents map:', docsMap);
            setUploadedDocuments(docsMap);
          }
        } catch (error) {
          console.error('Error loading data:', error);
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

    loadData();
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

  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, { url: string; name: string; id: string }>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [deletingDocuments, setDeletingDocuments] = useState<Record<string, boolean>>({});
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
    } 

    // Document validation - check if uploaded or file selected
    if (!uploadedDocuments.aadhaar_front && !files.aadhaar_front) {
      newErrors.aadhaar_front = 'Aadhaar front is required';
    }

    if (!uploadedDocuments.aadhaar_back && !files.aadhaar_back) {
      newErrors.aadhaar_back = 'Aadhaar back is required';
    }

    if (!uploadedDocuments.electricity_bill && !files.electricity_bill) {
      newErrors.electricity_bill = 'Electricity bill is required';
    }

    if (!uploadedDocuments.bank_passbook && !files.bank_passbook) {
      newErrors.bank_passbook = 'Bank passbook is required';
    }

    if (!uploadedDocuments.cancelled_cheque && !files.cancelled_cheque) {
      newErrors.cancelled_cheque = 'Cancelled cheque is required';
    }

    if (!uploadedDocuments.pan_card && !files.pan_card) {
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

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (!fileList || !fileList[0] || !leadId) return;

    const file = fileList[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Upload file immediately
    try {
      setUploadProgress((prev) => ({ ...prev, [name]: 0 }));

      const formData = new FormData();
      formData.append('leadId', leadId);
      formData.append('documentCategory', name);
      formData.append('file', file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { document } = await response.json();
      
      // Update uploaded documents
      setUploadedDocuments((prev) => ({
        ...prev,
        [name]: {
          url: document.public_url || document.file_path,
          name: document.file_name,
          id: document.id,
        },
      }));

      setUploadProgress((prev) => ({ ...prev, [name]: 100 }));
      
      // Clear progress after animation
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[name];
          return newProgress;
        });
      }, 1000);
    } catch (error) {
      console.error(`Error uploading ${name}:`, error);
      setErrors((prev) => ({
        ...prev,
        [name]: error instanceof Error ? error.message : 'Upload failed',
      }));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[name];
        return newProgress;
      });
    }
  }, [errors, leadId]);

  const handleViewDocument = useCallback(async (documentId: string) => {
    try {
      console.log('Viewing document with ID:', documentId);
      const response = await fetch(`/api/documents/view?documentId=${documentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('View error response:', error);
        throw new Error(error.error || 'Failed to load document');
      }

      const { url } = await response.json();
      console.log('Opening URL:', url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert(error instanceof Error ? error.message : 'Failed to view document');
    }
  }, []);

  const handleDeleteDocument = useCallback(async (documentCategory: string, documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      console.log('Deleting document:', { documentCategory, documentId });
      setDeletingDocuments((prev) => ({ ...prev, [documentCategory]: true }));

      const response = await fetch(`/api/documents/delete?documentId=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete error response:', error);
        throw new Error(error.error || 'Delete failed');
      }

      console.log('Document deleted successfully');

      // Remove from uploaded documents
      setUploadedDocuments((prev) => {
        const newDocs = { ...prev };
        delete newDocs[documentCategory];
        return newDocs;
      });

      // Clear any file input
      const fileInput = document.getElementById(documentCategory) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error(`Error deleting ${documentCategory}:`, error);
      setErrors((prev) => ({
        ...prev,
        [documentCategory]: error instanceof Error ? error.message : 'Delete failed',
      }));
    } finally {
      setDeletingDocuments((prev) => {
        const newDeleting = { ...prev };
        delete newDeleting[documentCategory];
        return newDeleting;
      });
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isSubmitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            ℹ️ This customer profile has been submitted and cannot be edited.
          </p>
        </div>
      )}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
                disabled={isLoading || isSubmitted}
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
                disabled={isLoading || isSubmitted}
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
                disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
              disabled={isLoading || isSubmitted}
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
          {/* Helper function to render file input with progress */}
          {[
            { id: 'aadhaar_front', label: 'Aadhaar Card (Front)', required: true },
            { id: 'aadhaar_back', label: 'Aadhaar Card (Back)', required: true },
            { id: 'electricity_bill', label: 'Electricity Bill', required: true },
            { id: 'bank_passbook', label: 'Bank Passbook', required: true },
            { id: 'cancelled_cheque', label: 'Cancelled Cheque', required: true },
            { id: 'pan_card', label: 'PAN Card', required: true },
            { id: 'itr_documents', label: 'ITR/Other Documents', required: false },
          ].map(({ id, label, required }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              
              {uploadProgress[id] !== undefined ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-blue-700">Uploading...</span>
                </div>
              ) : uploadedDocuments[id] ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-green-700 truncate">{uploadedDocuments[id].name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      type="button"
                      onClick={() => handleViewDocument(uploadedDocuments[id].id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      title="View document"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(id, uploadedDocuments[id].id)}
                      disabled={deletingDocuments[id]}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete document"
                    >
                      {deletingDocuments[id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="file"
                  id={id}
                  name={id}
                  onChange={handleFileChange}
                  disabled={isLoading || isSubmitted}
                  accept="image/*,.pdf"
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors[id] ? 'border-red-300' : ''
                  }`}
                />
              )}
              {errors[id] && (
                <p className="mt-1 text-sm text-red-600">{errors[id]}</p>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitted}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitted ? 'Back' : 'Cancel'}
        </button>
        
        {!isSubmitted && (
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!leadId) {
                  alert('Cannot save draft: No lead ID provided');
                  return;
                }

                try {
                  console.log('formData', formData);
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
                    // Get session to determine role-based redirect
                    const sessionResponse = await fetch('/api/auth/session');
                    const session = await sessionResponse.json();
                    const role = (session?.user?.role || 'customer') as UserRole;
                    router.push(getDashboardPath(role));
                  } else {
                    const error = await response.json();
                    if (error.error === 'Cannot edit submitted profile') {
                      alert('This profile has already been submitted and cannot be edited.');
                      setIsSubmitted(true);
                    } else {
                      alert(`Failed to save draft: ${error.error || 'Unknown error'}`);
                    }
                  }
                } catch (error) {
                  console.error('Error saving draft:', error);
                  alert('Failed to save draft. Please try again.');
                }
              }}
              disabled={isLoading || isSubmitted}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitted}
              className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Customer Profile'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
