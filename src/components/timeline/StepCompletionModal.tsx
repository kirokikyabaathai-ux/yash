/**
 * Step Completion Modal Component
 * 
 * Modal for completing timeline steps with remarks and attachments.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

'use client';

import { useState } from 'react';
import type { TimelineStepData } from './TimelineStep';

interface StepCompletionModalProps {
  step: TimelineStepData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { remarks?: string; attachments?: string[] }) => Promise<void>;
  isLoading?: boolean;
}

export function StepCompletionModal({
  step,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: StepCompletionModalProps) {
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step.remarks_required && !remarks.trim()) {
      newErrors.remarks = 'Remarks are required for this step';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: { remarks?: string; attachments?: string[] } = {};
    if (remarks.trim()) {
      data.remarks = remarks.trim();
    }

    await onSubmit(data);
    setRemarks('');
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      setRemarks('');
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Complete Step: {step.step_name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Mark this step as completed. {step.remarks_required && 'Remarks are required.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-6 space-y-4">
                {/* Remarks */}
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                    Remarks {step.remarks_required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                      if (errors.remarks) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.remarks;
                          return newErrors;
                        });
                      }
                    }}
                    disabled={isLoading}
                    rows={4}
                    placeholder="Enter any notes or comments about this step..."
                    className={`mt-1 block w-full rounded-md border ${
                      errors.remarks ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.remarks && (
                    <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                  )}
                </div>

                {/* Attachments Info */}
                {step.attachments_allowed && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Attachments can be uploaded separately through the
                      document management section.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Completing...' : 'Complete Step'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
