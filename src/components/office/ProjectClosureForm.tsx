/**
 * ProjectClosureForm Component
 * 
 * Allows office team or admin to close a project when all mandatory steps are completed.
 * Records closure date, closed_by user ID, and final remarks.
 * Updates lead status to "Closed" and prevents further timeline modifications.
 */

'use client';

import React, { useState } from 'react';
import type { Lead, LeadStep, StepMaster } from '@/types/api';

interface ProjectClosureFormProps {
  lead: Lead;
  closureStep: LeadStep;
  stepMaster: StepMaster;
  allSteps: LeadStep[];
  onClosureComplete?: () => void;
  onClosureError?: (error: string) => void;
}

interface ClosureDetails {
  finalRemarks: string;
  confirmClosure: boolean;
}

export function ProjectClosureForm({
  lead,
  closureStep,
  stepMaster,
  allSteps,
  onClosureComplete,
  onClosureError,
}: ProjectClosureFormProps) {
  const [closureDetails, setClosureDetails] = useState<ClosureDetails>({
    finalRemarks: '',
    confirmClosure: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof ClosureDetails,
    value: string | boolean
  ) => {
    setClosureDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if all mandatory steps are completed
  const checkMandatoryStepsCompleted = (): { completed: boolean; pendingSteps: string[] } => {
    const pendingSteps: string[] = [];
    
    // For now, we'll check if all steps except the closure step are completed
    // In a real implementation, you'd filter for mandatory steps only
    allSteps.forEach((step) => {
      if (step.id !== closureStep.id && step.status !== 'completed') {
        pendingSteps.push(step.step_id);
      }
    });

    return {
      completed: pendingSteps.length === 0,
      pendingSteps,
    };
  };

  const validateForm = (): string | null => {
    const { completed, pendingSteps } = checkMandatoryStepsCompleted();
    
    if (!completed) {
      return `Cannot close project. ${pendingSteps.length} mandatory step(s) are still pending.`;
    }

    if (!closureDetails.finalRemarks.trim()) {
      return 'Please provide final remarks for project closure';
    }

    if (!closureDetails.confirmClosure) {
      return 'Please confirm that you want to close this project';
    }

    return null;
  };

  const formatClosureRemarks = (): string => {
    return JSON.stringify({
      type: 'project_closure',
      finalRemarks: closureDetails.finalRemarks,
      closureDate: new Date().toISOString(),
      leadStatus: 'closed',
      recordedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      if (onClosureError) {
        onClosureError(validationError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Complete the closure step
      const response = await fetch(
        `/api/leads/${lead.id}/steps/${closureStep.step_id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remarks: formatClosureRemarks(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to close project');
      }

      // Update lead status to "closed"
      const updateResponse = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed',
        }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error?.message || 'Failed to update lead status');
      }

      if (onClosureComplete) {
        onClosureComplete();
      }
    } catch (error) {
      console.error('Error closing project:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to close project';
      if (onClosureError) {
        onClosureError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepCompleted = closureStep.status === 'completed';
  const isClosed = lead.status === 'closed';

  if (isStepCompleted || isClosed) {
    // Display closure details if already completed
    let closureInfo: any = {};
    try {
      closureInfo = JSON.parse(closureStep.remarks || '{}');
    } catch {
      closureInfo = { finalRemarks: closureStep.remarks };
    }

    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Project Closed
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Closure Date:</span>
            <span className="font-medium">
              {closureInfo.closureDate
                ? new Date(closureInfo.closureDate).toLocaleDateString('en-IN')
                : closureStep.completed_at
                ? new Date(closureStep.completed_at).toLocaleDateString('en-IN')
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lead Status:</span>
            <span className="font-medium uppercase text-gray-700">
              {lead.status}
            </span>
          </div>
          {closureInfo.finalRemarks && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <span className="text-gray-600 block mb-1">Final Remarks:</span>
              <p className="text-gray-800">{closureInfo.finalRemarks}</p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-300">
            <span className="text-gray-600 block mb-1">Completed:</span>
            <p className="text-gray-800">
              {closureStep.completed_at
                ? new Date(closureStep.completed_at).toLocaleString('en-IN')
                : 'N/A'}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This project is closed. Timeline modifications are restricted.
            Only an Admin can reopen this project.
          </p>
        </div>
      </div>
    );
  }

  const { completed: allStepsCompleted, pendingSteps } = checkMandatoryStepsCompleted();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Close Project
      </h3>

      {!allStepsCompleted && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 font-medium mb-2">
            Cannot close project yet
          </p>
          <p className="text-sm text-red-700">
            {pendingSteps.length} mandatory step(s) are still pending. Please complete all
            required steps before closing the project.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="finalRemarks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Final Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            id="finalRemarks"
            value={closureDetails.finalRemarks}
            onChange={(e) => handleInputChange('finalRemarks', e.target.value)}
            disabled={isSubmitting || !allStepsCompleted}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Provide final remarks about the project completion, customer satisfaction, any outstanding items, etc."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            These remarks will be permanently recorded with the project closure.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="confirmClosure"
                type="checkbox"
                checked={closureDetails.confirmClosure}
                onChange={(e) => handleInputChange('confirmClosure', e.target.checked)}
                disabled={isSubmitting || !allStepsCompleted}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="confirmClosure"
                className="text-sm font-medium text-gray-700"
              >
                I confirm that I want to close this project <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Closing the project will update the lead status to "Closed" and prevent further
                timeline modifications unless reopened by an Admin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !allStepsCompleted}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Closing Project...' : 'Close Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
