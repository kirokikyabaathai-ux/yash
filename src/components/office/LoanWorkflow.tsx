/**
 * LoanWorkflow Component
 * 
 * Allows office team to manage loan workflow for leads.
 * Creates loan-specific timeline steps dynamically and tracks loan application and approval.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';

interface LoanWorkflowProps {
  lead: Lead;
  onLoanInitiated?: () => void;
  onLoanError?: (error: string) => void;
}

interface LoanDetails {
  loanProvider: string;
  loanAmount: string;
  interestRate: string;
  tenure: string;
  applicationDate: string;
  applicationReference: string;
  remarks: string;
}

interface LoanStepData {
  step: StepMaster;
  leadStep: LeadStep;
}

export function LoanWorkflow({
  lead,
  onLoanInitiated,
  onLoanError,
}: LoanWorkflowProps) {
  const [loanSteps, setLoanSteps] = useState<LoanStepData[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanProvider: '',
    loanAmount: '',
    interestRate: '',
    tenure: '',
    applicationDate: new Date().toISOString().split('T')[0],
    applicationReference: '',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSteps, setIsCreatingSteps] = useState(false);

  useEffect(() => {
    fetchLoanSteps();
  }, [lead.id]);

  const fetchLoanSteps = async () => {
    setIsLoadingSteps(true);
    try {
      // Fetch all steps for this lead
      const response = await fetch(`/api/leads/${lead.id}/steps`);
      if (!response.ok) {
        throw new Error('Failed to fetch steps');
      }
      const data = await response.json();
      
      // Filter for loan-related steps (steps with "loan" in the name)
      const loanRelatedSteps = data.steps?.filter((s: any) =>
        s.step.step_name.toLowerCase().includes('loan')
      ) || [];
      
      setLoanSteps(loanRelatedSteps);
    } catch (error) {
      console.error('Error fetching loan steps:', error);
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const handleInputChange = (field: keyof LoanDetails, value: string) => {
    setLoanDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!loanDetails.loanProvider.trim()) {
      return 'Please enter the loan provider name';
    }
    if (!loanDetails.loanAmount || parseFloat(loanDetails.loanAmount) <= 0) {
      return 'Please enter a valid loan amount';
    }
    if (!loanDetails.interestRate || parseFloat(loanDetails.interestRate) < 0) {
      return 'Please enter a valid interest rate';
    }
    if (!loanDetails.tenure || parseInt(loanDetails.tenure) <= 0) {
      return 'Please enter a valid loan tenure';
    }
    if (!loanDetails.applicationDate) {
      return 'Please select an application date';
    }
    if (!loanDetails.applicationReference.trim()) {
      return 'Please enter an application reference number';
    }
    return null;
  };

  const createLoanSteps = async () => {
    setIsCreatingSteps(true);
    try {
      // Create loan application step
      const applicationStepResponse = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_name: `Loan Application - ${loanDetails.loanProvider}`,
          order_index: 1000, // High number to place at end
          allowed_roles: ['office', 'admin'],
          remarks_required: true,
          attachments_allowed: true,
          customer_upload: false,
        }),
      });

      if (!applicationStepResponse.ok) {
        throw new Error('Failed to create loan application step');
      }

      const applicationStep = await applicationStepResponse.json();

      // Create loan approval step
      const approvalStepResponse = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_name: `Loan Approval - ${loanDetails.loanProvider}`,
          order_index: 1001, // Right after application
          allowed_roles: ['office', 'admin'],
          remarks_required: true,
          attachments_allowed: true,
          customer_upload: false,
        }),
      });

      if (!approvalStepResponse.ok) {
        throw new Error('Failed to create loan approval step');
      }

      const approvalStep = await approvalStepResponse.json();

      // Initialize these steps for the current lead
      await fetch(`/api/leads/${lead.id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIds: [applicationStep.id, approvalStep.id],
        }),
      });

      return { applicationStep, approvalStep };
    } catch (error) {
      console.error('Error creating loan steps:', error);
      throw error;
    } finally {
      setIsCreatingSteps(false);
    }
  };

  const handleInitiateLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      if (onLoanError) {
        onLoanError(validationError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Create loan steps
      const { applicationStep } = await createLoanSteps();

      // Complete the loan application step with details
      const loanApplicationRemarks = JSON.stringify({
        type: 'loan_application',
        loanProvider: loanDetails.loanProvider,
        loanAmount: parseFloat(loanDetails.loanAmount),
        interestRate: parseFloat(loanDetails.interestRate),
        tenure: parseInt(loanDetails.tenure),
        applicationDate: loanDetails.applicationDate,
        applicationReference: loanDetails.applicationReference,
        remarks: loanDetails.remarks,
        initiatedAt: new Date().toISOString(),
      });

      const completeResponse = await fetch(
        `/api/leads/${lead.id}/steps/${applicationStep.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: loanApplicationRemarks,
          }),
        }
      );

      if (!completeResponse.ok) {
        throw new Error('Failed to record loan application');
      }

      // Refresh loan steps
      await fetchLoanSteps();
      setShowLoanForm(false);
      
      if (onLoanInitiated) {
        onLoanInitiated();
      }
    } catch (error) {
      console.error('Error initiating loan:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initiate loan';
      if (onLoanError) {
        onLoanError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteLoanApproval = async (
    stepId: string,
    approvalStatus: 'approved' | 'rejected',
    remarks: string
  ) => {
    try {
      const approvalRemarks = JSON.stringify({
        type: 'loan_approval',
        status: approvalStatus,
        remarks: remarks,
        approvedAt: new Date().toISOString(),
      });

      const response = await fetch(
        `/api/leads/${lead.id}/steps/${stepId}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: approvalRemarks,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record loan approval');
      }

      await fetchLoanSteps();
    } catch (error) {
      console.error('Error completing loan approval:', error);
      if (onLoanError) {
        onLoanError('Failed to record loan approval');
      }
    }
  };

  if (isLoadingSteps) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasLoanSteps = loanSteps.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Loan Workflow
          </h3>
          {!hasLoanSteps && !showLoanForm && (
            <button
              onClick={() => setShowLoanForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              Initiate Loan
            </button>
          )}
        </div>

        {!hasLoanSteps && !showLoanForm && (
          <p className="text-gray-600 text-sm">
            No loan workflow initiated for this lead. Click "Initiate Loan" to
            start the loan application process.
          </p>
        )}

        {showLoanForm && (
          <form onSubmit={handleInitiateLoan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="loanProvider"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loan Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="loanProvider"
                  value={loanDetails.loanProvider}
                  onChange={(e) =>
                    handleInputChange('loanProvider', e.target.value)
                  }
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., HDFC Bank, SBI, etc."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="loanAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loan Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="loanAmount"
                  value={loanDetails.loanAmount}
                  onChange={(e) =>
                    handleInputChange('loanAmount', e.target.value)
                  }
                  min="0"
                  step="0.01"
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter loan amount"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="interestRate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="interestRate"
                  value={loanDetails.interestRate}
                  onChange={(e) =>
                    handleInputChange('interestRate', e.target.value)
                  }
                  min="0"
                  step="0.01"
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 8.5"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tenure"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tenure (months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="tenure"
                  value={loanDetails.tenure}
                  onChange={(e) => handleInputChange('tenure', e.target.value)}
                  min="1"
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 60"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="applicationDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Application Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="applicationDate"
                  value={loanDetails.applicationDate}
                  onChange={(e) =>
                    handleInputChange('applicationDate', e.target.value)
                  }
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="applicationReference"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Application Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="applicationReference"
                  value={loanDetails.applicationReference}
                  onChange={(e) =>
                    handleInputChange('applicationReference', e.target.value)
                  }
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter application number"
                  required
                />
              </div>
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
                value={loanDetails.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                disabled={isSubmitting || isCreatingSteps}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Any additional notes about the loan..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isCreatingSteps}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting || isCreatingSteps
                  ? 'Initiating Loan...'
                  : 'Initiate Loan'}
              </button>
              <button
                type="button"
                onClick={() => setShowLoanForm(false)}
                disabled={isSubmitting || isCreatingSteps}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Display loan steps */}
      {hasLoanSteps && (
        <div className="space-y-4">
          {loanSteps.map((loanStep) => {
            const isCompleted = loanStep.leadStep.status === 'completed';
            let stepInfo: any = {};
            
            if (isCompleted && loanStep.leadStep.remarks) {
              try {
                stepInfo = JSON.parse(loanStep.leadStep.remarks);
              } catch {
                stepInfo = { remarks: loanStep.leadStep.remarks };
              }
            }

            return (
              <div
                key={loanStep.step.id}
                className={`border rounded-lg p-4 ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {loanStep.step.step_name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {isCompleted && (
                  <div className="space-y-2 text-sm">
                    {stepInfo.loanProvider && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">
                          {stepInfo.loanProvider}
                        </span>
                      </div>
                    )}
                    {stepInfo.loanAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">
                          ₹{stepInfo.loanAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {stepInfo.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium capitalize ${
                            stepInfo.status === 'approved'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stepInfo.status}
                        </span>
                      </div>
                    )}
                    {stepInfo.remarks && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-600 block mb-1">
                          Remarks:
                        </span>
                        <p className="text-gray-800">{stepInfo.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
