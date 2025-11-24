'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormProgress } from './FormProgress';
import { FormSection } from './FormSection';

// Zod validation schema
const pmSuryagharSchema = z.object({
  applicant_name: z.string().min(1, 'Applicant name is required'),
  applicant_phone: z.string().min(10, 'Valid phone number is required').max(15),
  applicant_email: z.union([z.string().email('Valid email is required'), z.literal('')]).optional(),
  property_address: z.string().min(5, 'Property address is required'),
  property_type: z.string().min(1, 'Property type is required'),
  roof_type: z.string().min(1, 'Roof type is required'),
  roof_area: z.union([z.number().positive('Roof area must be positive'), z.literal(0)]).optional(),
  kw_requirement: z.number().positive('KW requirement must be positive'),
  aadhar_number: z.string().regex(/^\d{12}$/, { message: 'Aadhar number must be 12 digits' }),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' }),
  bank_account_number: z.string().min(9, 'Valid account number is required').max(18),
  bank_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code' }),
  additional_data: z.record(z.string(), z.any()).optional(),
});

export type PMSuryagharFormData = z.infer<typeof pmSuryagharSchema>;

interface PMSuryagharFormProps {
  leadId: string;
  initialData?: Partial<PMSuryagharFormData>;
  onSubmit: (data: PMSuryagharFormData) => Promise<void>;
  onCancel?: () => void;
}

const STEPS = ['Applicant Info', 'Property Details', 'Financial Info', 'Review'];

export function PMSuryagharForm({
  leadId,
  initialData,
  onSubmit,
  onCancel,
}: PMSuryagharFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<PMSuryagharFormData>({
    resolver: zodResolver(pmSuryagharSchema),
    defaultValues: initialData,
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof PMSuryagharFormData)[] = [];
    
    if (currentStep === 0) {
      fieldsToValidate = ['applicant_name', 'applicant_phone', 'applicant_email'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['property_address', 'property_type', 'roof_type', 'roof_area', 'kw_requirement'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['aadhar_number', 'pan_number', 'bank_account_number', 'bank_ifsc'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = async (data: PMSuryagharFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const values = getValues();

    switch (currentStep) {
      case 0:
        return (
          <FormSection
            title="Applicant Information"
            description="Enter the details of the person applying for PM Suryaghar scheme"
          >
            <div>
              <label htmlFor="applicant_name" className="block text-sm font-medium text-gray-700">
                Applicant Name *
              </label>
              <input
                {...register('applicant_name')}
                type="text"
                id="applicant_name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.applicant_name && (
                <p className="mt-1 text-sm text-red-600">{errors.applicant_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="applicant_phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                {...register('applicant_phone')}
                type="tel"
                inputMode="tel"
                id="applicant_phone"
                autoComplete="tel"
                placeholder="1234567890"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.applicant_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.applicant_phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="applicant_email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('applicant_email')}
                type="email"
                inputMode="email"
                id="applicant_email"
                autoComplete="email"
                placeholder="example@email.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.applicant_email && (
                <p className="mt-1 text-sm text-red-600">{errors.applicant_email.message}</p>
              )}
            </div>
          </FormSection>
        );

      case 1:
        return (
          <FormSection
            title="Property Details"
            description="Provide information about the property where solar panels will be installed"
          >
            <div>
              <label htmlFor="property_address" className="block text-sm font-medium text-gray-700">
                Property Address *
              </label>
              <textarea
                {...register('property_address')}
                id="property_address"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.property_address && (
                <p className="mt-1 text-sm text-red-600">{errors.property_address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
                Property Type *
              </label>
              <select
                {...register('property_type')}
                id="property_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select property type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
              {errors.property_type && (
                <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="roof_type" className="block text-sm font-medium text-gray-700">
                Roof Type *
              </label>
              <select
                {...register('roof_type')}
                id="roof_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select roof type</option>
                <option value="flat">Flat</option>
                <option value="sloped">Sloped</option>
                <option value="mixed">Mixed</option>
              </select>
              {errors.roof_type && (
                <p className="mt-1 text-sm text-red-600">{errors.roof_type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="roof_area" className="block text-sm font-medium text-gray-700">
                Roof Area (sq ft)
              </label>
              <input
                {...register('roof_area', { valueAsNumber: true })}
                type="number"
                inputMode="decimal"
                id="roof_area"
                step="0.01"
                placeholder="100.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.roof_area && (
                <p className="mt-1 text-sm text-red-600">{errors.roof_area.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="kw_requirement" className="block text-sm font-medium text-gray-700">
                KW Requirement *
              </label>
              <input
                {...register('kw_requirement', { valueAsNumber: true })}
                type="number"
                inputMode="decimal"
                id="kw_requirement"
                step="0.01"
                placeholder="5.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.kw_requirement && (
                <p className="mt-1 text-sm text-red-600">{errors.kw_requirement.message}</p>
              )}
            </div>
          </FormSection>
        );

      case 2:
        return (
          <FormSection
            title="Financial Information"
            description="Enter banking and identification details for subsidy processing"
          >
            <div>
              <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
                Aadhar Number *
              </label>
              <input
                {...register('aadhar_number')}
                type="text"
                inputMode="numeric"
                id="aadhar_number"
                maxLength={12}
                placeholder="123456789012"
                autoComplete="off"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.aadhar_number && (
                <p className="mt-1 text-sm text-red-600">{errors.aadhar_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700">
                PAN Number *
              </label>
              <input
                {...register('pan_number')}
                type="text"
                id="pan_number"
                maxLength={10}
                placeholder="ABCDE1234F"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
              />
              {errors.pan_number && (
                <p className="mt-1 text-sm text-red-600">{errors.pan_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
                Bank Account Number *
              </label>
              <input
                {...register('bank_account_number')}
                type="text"
                inputMode="numeric"
                id="bank_account_number"
                autoComplete="off"
                placeholder="1234567890"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base touch-manipulation"
              />
              {errors.bank_account_number && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_account_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_ifsc" className="block text-sm font-medium text-gray-700">
                IFSC Code *
              </label>
              <input
                {...register('bank_ifsc')}
                type="text"
                id="bank_ifsc"
                maxLength={11}
                placeholder="ABCD0123456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
              />
              {errors.bank_ifsc && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_ifsc.message}</p>
              )}
            </div>
          </FormSection>
        );

      case 3:
        return (
          <FormSection
            title="Review & Submit"
            description="Please review all information before submitting"
          >
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Applicant Information</h4>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Name:</dt>
                    <dd className="font-medium">{values.applicant_name}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Phone:</dt>
                    <dd className="font-medium">{values.applicant_phone}</dd>
                  </div>
                  {values.applicant_email && (
                    <div>
                      <dt className="text-gray-600">Email:</dt>
                      <dd className="font-medium">{values.applicant_email}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Property Details</h4>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Address:</dt>
                    <dd className="font-medium">{values.property_address}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Property Type:</dt>
                    <dd className="font-medium capitalize">{values.property_type}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Roof Type:</dt>
                    <dd className="font-medium capitalize">{values.roof_type}</dd>
                  </div>
                  {values.roof_area && (
                    <div>
                      <dt className="text-gray-600">Roof Area:</dt>
                      <dd className="font-medium">{values.roof_area} sq ft</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-600">KW Requirement:</dt>
                    <dd className="font-medium">{values.kw_requirement} KW</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Financial Information</h4>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Aadhar Number:</dt>
                    <dd className="font-medium">{values.aadhar_number}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">PAN Number:</dt>
                    <dd className="font-medium">{values.pan_number}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Bank Account:</dt>
                    <dd className="font-medium">{values.bank_account_number}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">IFSC Code:</dt>
                    <dd className="font-medium">{values.bank_ifsc}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <FormProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {renderStepContent()}

          <div className="mt-8 flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
              )}
              {onCancel && currentStep === 0 && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
            </div>

            <div>
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
