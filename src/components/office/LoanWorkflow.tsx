/**
 * LoanWorkflow Component
 * 
 * Allows office team to manage loan workflow for leads.
 * Creates loan-specific timeline steps dynamically and tracks loan application and approval.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasLoanSteps = loanSteps.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Loan Workflow</CardTitle>
          {!hasLoanSteps && !showLoanForm && (
            <button
              onClick={() => setShowLoanForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors text-sm font-medium shadow-sm"
            >
              Initiate Loan
            </button>
          )}
        </CardHeader>
        <CardContent>
        {!hasLoanSteps && !showLoanForm && (
          <p className="text-muted-foreground text-sm">
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
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Loan Provider <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="loanProvider"
                  value={loanDetails.loanProvider}
                  onChange={(e) =>
                    handleInputChange('loanProvider', e.target.value)
                  }
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="e.g., HDFC Bank, SBI, etc."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="loanAmount"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Loan Amount (₹) <span className="text-destructive">*</span>
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
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter loan amount"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="interestRate"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Interest Rate (%) <span className="text-destructive">*</span>
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
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="e.g., 8.5"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tenure"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Tenure (months) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  id="tenure"
                  value={loanDetails.tenure}
                  onChange={(e) => handleInputChange('tenure', e.target.value)}
                  min="1"
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="e.g., 60"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="applicationDate"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Application Date <span className="text-destructive">*</span>
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
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="applicationReference"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Application Reference <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="applicationReference"
                  value={loanDetails.applicationReference}
                  onChange={(e) =>
                    handleInputChange('applicationReference', e.target.value)
                  }
                  disabled={isSubmitting || isCreatingSteps}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter application number"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="remarks"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Additional Remarks
              </label>
              <textarea
                id="remarks"
                value={loanDetails.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                disabled={isSubmitting || isCreatingSteps}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Any additional notes about the loan..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isCreatingSteps}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {isSubmitting || isCreatingSteps
                  ? 'Initiating Loan...'
                  : 'Initiate Loan'}
              </button>
              <button
                type="button"
                onClick={() => setShowLoanForm(false)}
                disabled={isSubmitting || isCreatingSteps}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        </CardContent>
      </Card>

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
                className={`border rounded-lg p-4 transition-colors ${
                  isCompleted
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-accent border-accent-foreground/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">
                    {loanStep.step.step_name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      isCompleted
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {isCompleted && (
                  <div className="space-y-2 text-sm">
                    {stepInfo.loanProvider && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium text-foreground">
                          {stepInfo.loanProvider}
                        </span>
                      </div>
                    )}
                    {stepInfo.loanAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium text-foreground">
                          ₹{stepInfo.loanAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {stepInfo.status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={`font-medium capitalize ${
                            stepInfo.status === 'approved'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-destructive'
                          }`}
                        >
                          {stepInfo.status}
                        </span>
                      </div>
                    )}
                    {stepInfo.remarks && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <span className="text-muted-foreground block mb-1">
                          Remarks:
                        </span>
                        <p className="text-foreground">{stepInfo.remarks}</p>
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
