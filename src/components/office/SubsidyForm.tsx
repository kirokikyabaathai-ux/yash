/**
 * SubsidyForm Component
 * 
 * Allows office team to submit subsidy application details.
 * Subsidy step is enabled after commissioning completion.
 * Subsidy amount and application details are stored in step remarks.
 */

'use client';

import React, { useState } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';
import { getPolishedInputClasses, standardTransitions } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface SubsidyFormProps {
  lead: Lead;
  subsidyStep: LeadStep;
  stepMaster: StepMaster;
  onSubsidyComplete?: () => void;
  onSubsidyError?: (error: string) => void;
}

interface SubsidyDetails {
  applicationReference: string;
  submissionDate: string;
  subsidyAmount: string;
  subsidyScheme: string;
  expectedReleaseDate: string;
  remarks: string;
}

export function SubsidyForm({
  lead,
  subsidyStep,
  stepMaster,
  onSubsidyComplete,
  onSubsidyError,
}: SubsidyFormProps) {
  const [subsidyDetails, setSubsidyDetails] = useState<SubsidyDetails>({
    applicationReference: '',
    submissionDate: new Date().toISOString().split('T')[0],
    subsidyAmount: '',
    subsidyScheme: 'PM Surya Ghar',
    expectedReleaseDate: '',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof SubsidyDetails,
    value: string
  ) => {
    setSubsidyDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!subsidyDetails.applicationReference.trim()) {
      return 'Please enter the application reference number';
    }
    if (!subsidyDetails.submissionDate) {
      return 'Please select the submission date';
    }
    if (!subsidyDetails.subsidyAmount || parseFloat(subsidyDetails.subsidyAmount) <= 0) {
      return 'Please enter a valid subsidy amount';
    }
    if (!subsidyDetails.subsidyScheme.trim()) {
      return 'Please enter the subsidy scheme name';
    }
    return null;
  };

  const formatSubsidyRemarks = (): string => {
    return JSON.stringify({
      type: 'subsidy_application',
      applicationReference: subsidyDetails.applicationReference,
      submissionDate: subsidyDetails.submissionDate,
      subsidyAmount: parseFloat(subsidyDetails.subsidyAmount),
      subsidyScheme: subsidyDetails.subsidyScheme,
      expectedReleaseDate: subsidyDetails.expectedReleaseDate || null,
      remarks: subsidyDetails.remarks,
      recordedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      if (onSubsidyError) {
        onSubsidyError(validationError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/leads/${lead.id}/steps/${subsidyStep.step_id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: formatSubsidyRemarks(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to submit subsidy application');
      }

      if (onSubsidyComplete) {
        onSubsidyComplete();
      }
    } catch (error) {
      console.error('Error submitting subsidy application:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit subsidy application';
      if (onSubsidyError) {
        onSubsidyError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepCompleted = subsidyStep.status === 'completed';

  if (isStepCompleted) {
    // Display subsidy details if already completed
    let subsidyInfo: any = {};
    try {
      subsidyInfo = JSON.parse(subsidyStep.remarks || '{}');
    } catch {
      subsidyInfo = { remarks: subsidyStep.remarks };
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Subsidy Application Submitted
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Application Reference:</span>
            <span className="font-medium">
              {subsidyInfo.applicationReference || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Submission Date:</span>
            <span className="font-medium">
              {subsidyInfo.submissionDate
                ? new Date(subsidyInfo.submissionDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subsidy Amount:</span>
            <span className="font-medium">
              ₹{subsidyInfo.subsidyAmount?.toLocaleString('en-IN') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subsidy Scheme:</span>
            <span className="font-medium">
              {subsidyInfo.subsidyScheme || 'N/A'}
            </span>
          </div>
          {subsidyInfo.expectedReleaseDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Release Date:</span>
              <span className="font-medium">
                {new Date(subsidyInfo.expectedReleaseDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          )}
          {subsidyInfo.remarks && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <span className="text-gray-600 block mb-1">Remarks:</span>
              <p className="text-gray-800">{subsidyInfo.remarks}</p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-green-200">
            <span className="text-gray-600 block mb-1">Completed:</span>
            <p className="text-gray-800">
              {subsidyStep.completed_at
                ? new Date(subsidyStep.completed_at).toLocaleString('en-IN')
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Submit Subsidy Application
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="applicationReference"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Application Reference Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="applicationReference"
            value={subsidyDetails.applicationReference}
            onChange={(e) => handleInputChange('applicationReference', e.target.value)}
            disabled={isSubmitting}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
            placeholder="Enter application reference number"
            required
          />
        </div>

        <div>
          <label
            htmlFor="submissionDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Submission Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="submissionDate"
            value={subsidyDetails.submissionDate}
            onChange={(e) => handleInputChange('submissionDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
            required
          />
        </div>

        <div>
          <label
            htmlFor="subsidyAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subsidy Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="subsidyAmount"
            value={subsidyDetails.subsidyAmount}
            onChange={(e) => handleInputChange('subsidyAmount', e.target.value)}
            min="0"
            step="0.01"
            disabled={isSubmitting}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
            placeholder="Enter subsidy amount"
            required
          />
        </div>

        <div>
          <label
            htmlFor="subsidyScheme"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subsidy Scheme <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subsidyScheme"
            value={subsidyDetails.subsidyScheme}
            onChange={(e) => handleInputChange('subsidyScheme', e.target.value)}
            disabled={isSubmitting}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
            placeholder="e.g., PM Surya Ghar"
            required
          />
        </div>

        <div>
          <label
            htmlFor="expectedReleaseDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expected Release Date
          </label>
          <input
            type="date"
            id="expectedReleaseDate"
            value={subsidyDetails.expectedReleaseDate}
            onChange={(e) => handleInputChange('expectedReleaseDate', e.target.value)}
            disabled={isSubmitting}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
          />
        </div>

        <div>
          <label
            htmlFor="remarks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Remarks
          </label>
          <textarea
            id="remarks"
            value={subsidyDetails.remarks}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className={getPolishedInputClasses('w-full px-3 py-2 text-sm')}
            placeholder="Any additional notes about the subsidy application..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium',
              standardTransitions.button,
              'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Subsidy Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
