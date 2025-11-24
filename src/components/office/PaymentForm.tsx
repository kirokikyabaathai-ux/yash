/**
 * PaymentForm Component
 * 
 * Allows office team to mark payment as received and store payment details.
 * Payment details are stored in the step remarks field.
 */

'use client';

import React, { useState } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';

interface PaymentFormProps {
  lead: Lead;
  paymentStep: LeadStep;
  stepMaster: StepMaster;
  onPaymentComplete?: () => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentDetails {
  amount: string;
  paymentDate: string;
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'card' | 'other';
  transactionReference: string;
  remarks: string;
}

export function PaymentForm({
  lead,
  paymentStep,
  stepMaster,
  onPaymentComplete,
  onPaymentError,
}: PaymentFormProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof PaymentDetails,
    value: string
  ) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0) {
      return 'Please enter a valid payment amount';
    }
    if (!paymentDetails.paymentDate) {
      return 'Please select a payment date';
    }
    if (!paymentDetails.paymentMethod) {
      return 'Please select a payment method';
    }
    if (!paymentDetails.transactionReference.trim()) {
      return 'Please enter a transaction reference';
    }
    return null;
  };

  const formatPaymentRemarks = (): string => {
    return JSON.stringify({
      type: 'payment',
      amount: parseFloat(paymentDetails.amount),
      paymentDate: paymentDetails.paymentDate,
      paymentMethod: paymentDetails.paymentMethod,
      transactionReference: paymentDetails.transactionReference,
      remarks: paymentDetails.remarks,
      recordedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      if (onPaymentError) {
        onPaymentError(validationError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/leads/${lead.id}/steps/${paymentStep.step_id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: formatPaymentRemarks(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to record payment');
      }

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to record payment';
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepCompleted = paymentStep.status === 'completed';

  if (isStepCompleted) {
    // Display payment details if already completed
    let paymentInfo: any = {};
    try {
      paymentInfo = JSON.parse(paymentStep.remarks || '{}');
    } catch {
      paymentInfo = { remarks: paymentStep.remarks };
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Payment Received
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              ₹{paymentInfo.amount?.toLocaleString('en-IN') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-medium">
              {paymentInfo.paymentDate
                ? new Date(paymentInfo.paymentDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium capitalize">
              {paymentInfo.paymentMethod?.replace('_', ' ') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Reference:</span>
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
          <div className="mt-3 pt-3 border-t border-green-200">
            <span className="text-gray-600 block mb-1">Completed:</span>
            <p className="text-gray-800">
              {paymentStep.completed_at
                ? new Date(paymentStep.completed_at).toLocaleString('en-IN')
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
        Record Payment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            value={paymentDetails.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            min="0"
            step="0.01"
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter amount"
            required
          />
        </div>

        <div>
          <label
            htmlFor="paymentDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="paymentDate"
            value={paymentDetails.paymentDate}
            onChange={(e) => handleInputChange('paymentDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        <div>
          <label
            htmlFor="paymentMethod"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            id="paymentMethod"
            value={paymentDetails.paymentMethod}
            onChange={(e) =>
              handleInputChange(
                'paymentMethod',
                e.target.value as PaymentDetails['paymentMethod']
              )
            }
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transactionReference"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Transaction Reference <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="transactionReference"
            value={paymentDetails.transactionReference}
            onChange={(e) =>
              handleInputChange('transactionReference', e.target.value)
            }
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter transaction ID, cheque number, etc."
            required
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
            value={paymentDetails.remarks}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Any additional notes about the payment..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
