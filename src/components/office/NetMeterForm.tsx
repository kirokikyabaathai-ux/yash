/**
 * NetMeterForm Component
 * 
 * Allows office team to submit net meter application details.
 * Net meter step is enabled after installation completion.
 * Application reference and submission date are stored in step remarks.
 */

'use client';

import React, { useState } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NetMeterFormProps {
  lead: Lead;
  netMeterStep: LeadStep;
  stepMaster: StepMaster;
  onNetMeterComplete?: () => void;
  onNetMeterError?: (error: string) => void;
}

interface NetMeterDetails {
  applicationReference: string;
  submissionDate: string;
  discomName: string;
  meterCapacity: string;
  remarks: string;
}

export function NetMeterForm({
  lead,
  netMeterStep,
  stepMaster,
  onNetMeterComplete,
  onNetMeterError,
}: NetMeterFormProps) {
  const [netMeterDetails, setNetMeterDetails] = useState<NetMeterDetails>({
    applicationReference: '',
    submissionDate: new Date().toISOString().split('T')[0],
    discomName: '',
    meterCapacity: '',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof NetMeterDetails,
    value: string
  ) => {
    setNetMeterDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!netMeterDetails.applicationReference.trim()) {
      return 'Please enter the application reference number';
    }
    if (!netMeterDetails.submissionDate) {
      return 'Please select the submission date';
    }
    if (!netMeterDetails.discomName.trim()) {
      return 'Please enter the DISCOM name';
    }
    if (!netMeterDetails.meterCapacity.trim()) {
      return 'Please enter the meter capacity';
    }
    return null;
  };

  const formatNetMeterRemarks = (): string => {
    return JSON.stringify({
      type: 'net_meter_application',
      applicationReference: netMeterDetails.applicationReference,
      submissionDate: netMeterDetails.submissionDate,
      discomName: netMeterDetails.discomName,
      meterCapacity: netMeterDetails.meterCapacity,
      remarks: netMeterDetails.remarks,
      recordedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      if (onNetMeterError) {
        onNetMeterError(validationError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/leads/${lead.id}/steps/${netMeterStep.step_id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: formatNetMeterRemarks(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to submit net meter application');
      }

      if (onNetMeterComplete) {
        onNetMeterComplete();
      }
    } catch (error) {
      console.error('Error submitting net meter application:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit net meter application';
      if (onNetMeterError) {
        onNetMeterError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepCompleted = netMeterStep.status === 'completed';

  if (isStepCompleted) {
    // Display net meter details if already completed
    let netMeterInfo: any = {};
    try {
      netMeterInfo = JSON.parse(netMeterStep.remarks || '{}');
    } catch {
      netMeterInfo = { remarks: netMeterStep.remarks };
    }

    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
          Net Meter Application Submitted
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application Reference:</span>
            <span className="font-medium text-foreground">
              {netMeterInfo.applicationReference || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submission Date:</span>
            <span className="font-medium text-foreground">
              {netMeterInfo.submissionDate
                ? new Date(netMeterInfo.submissionDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">DISCOM Name:</span>
            <span className="font-medium text-foreground">
              {netMeterInfo.discomName || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Meter Capacity:</span>
            <span className="font-medium text-foreground">
              {netMeterInfo.meterCapacity || 'N/A'}
            </span>
          </div>
          {netMeterInfo.remarks && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <span className="text-muted-foreground block mb-1">Remarks:</span>
              <p className="text-foreground">{netMeterInfo.remarks}</p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
            <span className="text-muted-foreground block mb-1">Completed:</span>
            <p className="text-foreground">
              {netMeterStep.completed_at
                ? new Date(netMeterStep.completed_at).toLocaleString('en-IN')
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Net Meter Application</CardTitle>
      </CardHeader>
      <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="applicationReference"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Application Reference Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="applicationReference"
            value={netMeterDetails.applicationReference}
            onChange={(e) => handleInputChange('applicationReference', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Enter application reference number"
            required
          />
        </div>

        <div>
          <label
            htmlFor="submissionDate"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Submission Date <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            id="submissionDate"
            value={netMeterDetails.submissionDate}
            onChange={(e) => handleInputChange('submissionDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="discomName"
            className="block text-sm font-medium text-foreground mb-1"
          >
            DISCOM Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="discomName"
            value={netMeterDetails.discomName}
            onChange={(e) => handleInputChange('discomName', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Enter DISCOM name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="meterCapacity"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Meter Capacity <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="meterCapacity"
            value={netMeterDetails.meterCapacity}
            onChange={(e) => handleInputChange('meterCapacity', e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="e.g., 5 kW"
            required
          />
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
            value={netMeterDetails.remarks}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Any additional notes about the net meter application..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Net Meter Application'}
          </button>
        </div>
      </form>
      </CardContent>
    </Card>
  );
}
