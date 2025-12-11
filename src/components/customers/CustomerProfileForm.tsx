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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/ui/loading-button';
import { FormField } from '@/components/ui/molecules/FormField';
import { Combobox } from '@/components/ui/combobox';
import { INDIAN_STATES, getDistrictsByState } from '@/data/indian-states-districts';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface CustomerProfileFormProps {
  onSubmit: (data: CustomerProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  leadId?: string;
  leadData?: Lead;
}

export function CustomerProfileForm({ onSubmit, onCancel, isLoading = false, leadId, leadData }: CustomerProfileFormProps) {
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState<Partial<CustomerProfileFormData>>({
    name: '',
    father_name: '',
    gender: undefined,
    address_line_1: '',
    address_line_2: '',
    pin_code: '',
    state: '',
    district: '',
    account_holder_name: '',
    bank_account_number: '',
    bank_name: '',
    branch_name: '',
    bank_address: '',
    ifsc_code: '',
    lead_id: leadId,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load draft, documents, and auto-fill form
  useEffect(() => {
    const loadData = async () => {
      if (leadId) {
        try {
          // Load profile data from documents table
          const profileResponse = await fetch(`/api/leads/${leadId}/documents?category=profile`);
          if (profileResponse.ok) {
            const responseData = await profileResponse.json();
            console.log('Profile response:', responseData);
            
            // Handle both array and object with documents property
            const documents = Array.isArray(responseData) ? responseData : responseData.documents;
            const profileDoc = documents?.find((d: any) => d.document_category === 'profile');
            
            console.log('Profile document found:', profileDoc);
            
            if (profileDoc) {
              // Note: We don't set isSubmitted here to allow editing
              // The form can be re-submitted to update the profile
              
              // Load form data from form_json
              if (profileDoc.form_json) {
                const formJson = profileDoc.form_json;
                console.log('Loading form data:', formJson);
                setFormData((prev) => ({
                  ...prev,
                  name: formJson.name || prev.name,
                  father_name: formJson.father_name || prev.father_name,
                  gender: formJson.gender || prev.gender,
                  address_line_1: formJson.address_line_1 || prev.address_line_1,
                  address_line_2: formJson.address_line_2 || prev.address_line_2,
                  pin_code: formJson.pin_code || prev.pin_code,
                  state: formJson.state || prev.state,
                  district: formJson.district || prev.district,
                  account_holder_name: formJson.account_holder_name || prev.account_holder_name,
                  bank_account_number: formJson.bank_account_number || prev.bank_account_number,
                  bank_name: formJson.bank_name || prev.bank_name,
                  branch_name: formJson.branch_name || prev.branch_name,
                  bank_address: formJson.bank_address || prev.bank_address,
                  ifsc_code: formJson.ifsc_code || prev.ifsc_code,
                }));
              }
            }
          }

          // Load existing documents
          const docsResponse = await fetch(`/api/leads/${leadId}/documents`);
          if (docsResponse.ok) {
            const responseData = await docsResponse.json();
            console.log('Documents response:', responseData);
            
            // Handle both array and object with documents property
            const documents = Array.isArray(responseData) ? responseData : responseData.documents;
            const docsMap: Record<string, { url: string; name: string; id: string }> = {};
            
            // Check if documents is an array before calling forEach
            if (Array.isArray(documents)) {
              documents.forEach((doc: any) => {
                console.log('Processing document:', doc.document_category, doc);
                
                // Skip profile form document (it's not a file upload)
                if (doc.document_category === 'profile') return;
                
                // Only include valid, submitted file documents
                if (doc.status !== 'valid') return;
                
                // Only include actual file documents (aadhaar, pan, etc.)
                const fileDocCategories = [
                  'aadhaar_front', 'aadhaar_back', 'electricity_bill',
                  'bank_passbook', 'cancelled_cheque', 'pan_card', 'itr_documents'
                ];
                
                if (fileDocCategories.includes(doc.document_category)) {
                  console.log('Adding document to map:', doc.document_category);
                  docsMap[doc.document_category] = {
                    url: doc.public_url || doc.file_path,
                    name: doc.file_name,
                    id: doc.id,
                  };
                }
              });
            }
            
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

  // Load districts when state changes or form loads with state data
  useEffect(() => {
    if (formData.state) {
      setAvailableDistricts(getDistrictsByState(formData.state));
    }
  }, [formData.state]);

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
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

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

    if (!formData.branch_name?.trim()) {
      newErrors.branch_name = 'Branch name is required';
    }

    if (!formData.bank_address?.trim()) {
      newErrors.bank_address = 'Bank address is required';
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

  const handleStateChange = (stateName: string) => {
    setFormData((prev) => ({ ...prev, state: stateName, district: '' }));
    setAvailableDistricts(getDistrictsByState(stateName));
    if (errors.state) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      });
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData((prev) => ({ ...prev, district: districtName }));
    if (errors.district) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.district;
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
      toast.error(error instanceof Error ? error.message : 'Failed to view document');
    }
  }, []);

  const handleDeleteDocument = useCallback((documentCategory: string, documentId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Document',
      description: 'Are you sure you want to delete this document? This action cannot be undone.',
      onConfirm: async () => {
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
          toast.success('Document deleted successfully');

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
      },
    });
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
        <h3 className="text-lg font-semibold text-[var(--penpot-neutral-dark)]">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Name" required error={errors.name}>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.name ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Father's Name">
            <Input
              type="text"
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              placeholder="Shree..."
            />
          </FormField>

          <div>
            <label htmlFor="gender" className="block text-sm font-bold text-[var(--penpot-neutral-dark)] mb-2">
              Gender
            </label>
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => handleChange({ target: { name: 'gender', value } } as any)}
              disabled={isLoading || isSubmitted}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--penpot-neutral-dark)]">Address Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <FormField label="Address Line 1" required error={errors.address_line_1}>
            <Input
              type="text"
              id="address_line_1"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.address_line_1 ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Address Line 2">
            <Input
              type="text"
              id="address_line_2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Pin Code" required error={errors.pin_code}>
              <Input
                type="text"
                inputMode="numeric"
                id="pin_code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                disabled={isLoading || isSubmitted}
                maxLength={6}
                placeholder="123456"
                state={errors.pin_code ? 'error' : 'default'}
              />
            </FormField>

            <FormField label="State" required error={errors.state}>
              <Combobox
                id="state"
                options={INDIAN_STATES.map(state => ({
                  value: state.name,
                  label: state.name
                }))}
                value={formData.state}
                onValueChange={handleStateChange}
                placeholder="Select State"
                searchPlaceholder="Search state..."
                emptyText="No state found."
                disabled={isLoading || isSubmitted}
                className={errors.state ? 'border-red-500' : ''}
              />
            </FormField>

            <FormField label="District" required error={errors.district}>
              <Combobox
                id="district"
                options={availableDistricts.map(district => ({
                  value: district,
                  label: district
                }))}
                value={formData.district}
                onValueChange={handleDistrictChange}
                placeholder="Select District"
                searchPlaceholder="Search district..."
                emptyText={formData.state ? "No district found." : "Please select a state first."}
                disabled={isLoading || isSubmitted || !formData.state}
                className={errors.district ? 'border-red-500' : ''}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--penpot-neutral-dark)]">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Account Holder Name" required error={errors.account_holder_name}>
            <Input
              type="text"
              id="account_holder_name"
              name="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.account_holder_name ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Bank Account Number" required error={errors.bank_account_number}>
            <Input
              type="text"
              inputMode="numeric"
              id="bank_account_number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.bank_account_number ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Bank Name" required error={errors.bank_name}>
            <Input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.bank_name ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Branch Name" required error={errors.branch_name}>
            <Input
              type="text"
              id="branch_name"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.branch_name ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="Bank Address" required error={errors.bank_address}>
            <Input
              type="text"
              id="bank_address"
              name="bank_address"
              value={formData.bank_address}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              state={errors.bank_address ? 'error' : 'default'}
            />
          </FormField>

          <FormField label="IFSC Code" required error={errors.ifsc_code}>
            <Input
              type="text"
              id="ifsc_code"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              disabled={isLoading || isSubmitted}
              maxLength={11}
              placeholder="ABCD0123456"
              state={errors.ifsc_code ? 'error' : 'default'}
            />
          </FormField>
        </div>
      </div>

      {/* Document Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--penpot-neutral-dark)]">Document Upload</h3>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(uploadedDocuments[id].id)}
                      className="flex items-center gap-1"
                      title="View document"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Button>
                    <LoadingButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(id, uploadedDocuments[id].id)}
                      loading={deletingDocuments[id]}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      title="Delete document"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </LoadingButton>
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSubmitted}
          className="w-full sm:w-auto"
        >
          {isSubmitted ? 'Back' : 'Cancel'}
        </Button>
        
        {!isSubmitted && (
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              onClick={async () => {
                if (!leadId) {
                  toast.error('Cannot save draft: No lead ID provided');
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
                    toast.success('Draft saved successfully! You can continue filling the form later.');
                    // Get session to determine role-based redirect
                    const sessionResponse = await fetch('/api/auth/session');
                    const session = await sessionResponse.json();
                    const role = (session?.user?.role || 'customer') as UserRole;
                    router.push(getDashboardPath(role));
                  } else {
                    const error = await response.json();
                    if (error.error === 'Cannot edit submitted profile') {
                      toast.error('This profile has already been submitted and cannot be edited.');
                      setIsSubmitted(true);
                    } else {
                      toast.error(`Failed to save draft: ${error.error || 'Unknown error'}`);
                    }
                  }
                } catch (error) {
                  console.error('Error saving draft:', error);
                  toast.error('Failed to save draft. Please try again.');
                }
              }}
              disabled={isLoading || isSubmitted}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Save as Draft
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={isSubmitted}
              className="w-full sm:w-auto"
            >
              Submit Customer Profile
            </LoadingButton>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </form>
  );
}
