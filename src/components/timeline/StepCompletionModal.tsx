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
  leadInstallerId?: string | null;
  leadId?: string;
}

export function StepCompletionModal({
  step,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  leadInstallerId,
  leadId,
}: StepCompletionModalProps) {
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showInstallerWarning, setShowInstallerWarning] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step.remarks_required && !remarks.trim()) {
      newErrors.remarks = 'Remarks are required for this step';
    }

    // Check if installer assignment is required
    if (step.requires_installer_assignment && !leadInstallerId) {
      setShowInstallerWarning(true);
      return false;
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel */}
        <div className="relative bg-card rounded-lg text-left overflow-hidden shadow-xl border border-border transform transition-all w-full max-w-lg z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
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
                  <h3 className="text-lg leading-6 font-medium text-foreground">
                    Complete Step: {step.step_name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Mark this step as completed. {step.remarks_required && 'Remarks are required.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-6 space-y-4">
                {/* Installer Assignment Warning */}
                {step.requires_installer_assignment && !leadInstallerId && (
                  <div className="bg-accent border border-accent-foreground/20 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-accent-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-accent-foreground">
                          Installer Assignment Required
                        </h3>
                        <p className="mt-1 text-sm text-accent-foreground/90">
                          This step requires an installer to be assigned to the lead before it can be completed.
                          {leadId && (
                            <span className="block mt-2">
                              Please assign an installer in the lead details section first.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Installer Assignment Success */}
                {step.requires_installer_assignment && leadInstallerId && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                    <p className="text-sm text-green-800 dark:text-green-400">
                      <svg className="inline h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <strong>Installer assigned:</strong> Ready to complete this step
                    </p>
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-foreground">
                    Remarks {step.remarks_required && <span className="text-destructive">*</span>}
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
                      errors.remarks ? 'border-destructive' : 'border-input'
                    } bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed transition-colors`}
                  />
                  {errors.remarks && (
                    <p className="mt-1 text-sm text-destructive">{errors.remarks}</p>
                  )}
                </div>

                {/* Attachments Info */}
                {step.attachments_allowed && (
                  <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                    <p className="text-sm text-primary">
                      <strong>Note:</strong> Attachments can be uploaded separately through the
                      document management section.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Completing...' : 'Complete Step'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-input shadow-sm px-4 py-2 bg-background text-base font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
