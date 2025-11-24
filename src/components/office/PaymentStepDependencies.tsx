/**
 * PaymentStepDependencies Component
 * 
 * Manages payment step dependencies and enables installation scheduling
 * after payment or loan completion. Masks sensitive financial details for customers.
 */

'use client';

import React from 'react';
import type { LeadStep, StepMaster, User } from '@/types/api';

interface PaymentStepDependenciesProps {
  leadSteps: Array<{
    step: StepMaster;
    leadStep: LeadStep;
  }>;
  currentUser: User;
  onStepUpdate?: () => void;
}

export function PaymentStepDependencies({
  leadSteps,
  currentUser,
  onStepUpdate,
}: PaymentStepDependenciesProps) {
  // Find payment and loan related steps
  const paymentStep = leadSteps.find((s) =>
    s.step.step_name.toLowerCase().includes('payment')
  );
  const loanSteps = leadSteps.filter((s) =>
    s.step.step_name.toLowerCase().includes('loan')
  );
  const installationStep = leadSteps.find((s) =>
    s.step.step_name.toLowerCase().includes('installation')
  );

  // Check if payment or loan is completed
  const isPaymentCompleted = paymentStep?.leadStep.status === 'completed';
  const isLoanCompleted = loanSteps.some(
    (s) => s.leadStep.status === 'completed'
  );
  const isPaymentOrLoanCompleted = isPaymentCompleted || isLoanCompleted;

  // Check if installation step should be enabled
  const isInstallationEnabled =
    installationStep &&
    (installationStep.leadStep.status === 'pending' ||
      installationStep.leadStep.status === 'completed');

  const isCustomer = currentUser.role === 'customer';

  // Function to mask sensitive financial data for customers
  const getMaskedPaymentInfo = (remarks: string | null) => {
    if (!remarks) return null;

    try {
      const paymentInfo = JSON.parse(remarks);
      
      if (isCustomer) {
        // Mask sensitive details for customers
        return {
          type: paymentInfo.type,
          paymentDate: paymentInfo.paymentDate,
          paymentMethod: paymentInfo.paymentMethod,
          // Mask amount - show only that payment was received
          amountReceived: true,
          // Hide transaction reference
          // Hide exact amount
          remarks: paymentInfo.remarks,
        };
      }

      // Return full details for office/admin
      return paymentInfo;
    } catch {
      return { remarks };
    }
  };

  const renderPaymentStatus = () => {
    if (!paymentStep) return null;

    const paymentInfo = getMaskedPaymentInfo(paymentStep.leadStep.remarks);
    const isCompleted = paymentStep.leadStep.status === 'completed';

    return (
      <div
        className={`border rounded-lg p-4 ${
          isCompleted
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">Payment Status</h4>
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

        {isCompleted && paymentInfo && (
          <div className="space-y-2 text-sm">
            {isCustomer ? (
              // Customer view - masked details
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">
                    Payment Received
                  </span>
                </div>
                {paymentInfo.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(paymentInfo.paymentDate).toLocaleDateString(
                        'en-IN'
                      )}
                    </span>
                  </div>
                )}
                {paymentInfo.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">
                      {paymentInfo.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600">
                    Payment has been received and verified. Your installation
                    can now be scheduled.
                  </p>
                </div>
              </>
            ) : (
              // Office/Admin view - full details
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    ₹{paymentInfo.amount?.toLocaleString('en-IN') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {paymentInfo.paymentDate
                      ? new Date(paymentInfo.paymentDate).toLocaleDateString(
                          'en-IN'
                        )
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">
                    {paymentInfo.paymentMethod?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">
                    {paymentInfo.transactionReference || 'N/A'}
                  </span>
                </div>
                {paymentInfo.remarks && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="text-gray-600 block mb-1">Remarks:</span>
                    <p className="text-gray-800">{paymentInfo.remarks}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isCompleted && (
          <p className="text-sm text-gray-600 mt-2">
            Payment is pending. Installation scheduling will be enabled once
            payment is received or loan is approved.
          </p>
        )}
      </div>
    );
  };

  const renderLoanStatus = () => {
    if (loanSteps.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Loan Status</h4>
        {loanSteps.map((loanStep) => {
          const isCompleted = loanStep.leadStep.status === 'completed';
          let loanInfo: any = {};

          if (isCompleted && loanStep.leadStep.remarks) {
            try {
              loanInfo = JSON.parse(loanStep.leadStep.remarks);
            } catch {
              loanInfo = { remarks: loanStep.leadStep.remarks };
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
                <h5 className="font-medium text-gray-900">
                  {loanStep.step.step_name}
                </h5>
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
                  {isCustomer ? (
                    // Customer view - masked loan details
                    <>
                      {loanInfo.loanProvider && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">
                            {loanInfo.loanProvider}
                          </span>
                        </div>
                      )}
                      {loanInfo.status && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium capitalize ${
                              loanInfo.status === 'approved'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {loanInfo.status}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {loanInfo.status === 'approved'
                            ? 'Loan has been approved. Installation can now be scheduled.'
                            : 'Loan application is being processed.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    // Office/Admin view - full loan details
                    <>
                      {loanInfo.loanProvider && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">
                            {loanInfo.loanProvider}
                          </span>
                        </div>
                      )}
                      {loanInfo.loanAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">
                            ₹{loanInfo.loanAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {loanInfo.interestRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interest Rate:</span>
                          <span className="font-medium">
                            {loanInfo.interestRate}%
                          </span>
                        </div>
                      )}
                      {loanInfo.tenure && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tenure:</span>
                          <span className="font-medium">
                            {loanInfo.tenure} months
                          </span>
                        </div>
                      )}
                      {loanInfo.status && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium capitalize ${
                              loanInfo.status === 'approved'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {loanInfo.status}
                          </span>
                        </div>
                      )}
                      {loanInfo.remarks && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-600 block mb-1">
                            Remarks:
                          </span>
                          <p className="text-gray-800">{loanInfo.remarks}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInstallationStatus = () => {
    if (!installationStep) return null;

    const canScheduleInstallation =
      isPaymentOrLoanCompleted && isInstallationEnabled;

    return (
      <div
        className={`border rounded-lg p-4 ${
          canScheduleInstallation
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">Installation Status</h4>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              canScheduleInstallation
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {canScheduleInstallation ? 'Ready to Schedule' : 'Waiting'}
          </span>
        </div>

        {canScheduleInstallation ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Payment has been completed. Installation can now be scheduled.
            </p>
            {!isCustomer && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  Action Required: Assign an installer and schedule the
                  installation.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Installation scheduling will be enabled once payment is received or
            loan is approved.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment & Installation Dependencies
        </h3>

        <div className="space-y-4">
          {renderPaymentStatus()}
          {renderLoanStatus()}
          {renderInstallationStatus()}
        </div>

        {!isPaymentOrLoanCompleted && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> Installation cannot be
              scheduled until payment is received or loan is approved.
            </p>
          </div>
        )}

        {isPaymentOrLoanCompleted && isInstallationEnabled && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-medium">✓ Ready:</span> All payment
              requirements are met. Installation can now proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
