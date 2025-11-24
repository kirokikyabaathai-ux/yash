/**
 * Admin Override Component
 * 
 * Provides admin users with the ability to bypass all restrictions,
 * move timeline backward/forward, and skip steps.
 * 
 * Requirements: 11.1, 11.5
 */

'use client';

import { useState } from 'react';
import type { StepStatus } from '@/types/database';

interface TimelineStepOverride {
  id: string;
  step_id: string;
  step_name: string;
  order_index: number;
  status: StepStatus;
  completed_at: string | null;
}

interface AdminOverrideProps {
  leadId: string;
  leadStatus: string;
  steps: TimelineStepOverride[];
  onOverrideComplete: () => void;
}

type OverrideAction = 'move_forward' | 'move_backward' | 'skip_step' | 'reopen_step' | 'complete_step' | 'reopen_project';

export function AdminOverride({ leadId, leadStatus, steps, onOverrideComplete }: AdminOverrideProps) {
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [action, setAction] = useState<OverrideAction>('complete_step');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedStep = steps.find(s => s.id === selectedStepId);
  const isProjectClosed = leadStatus === 'closed';

  const handleOverride = async () => {
    if (!selectedStepId) {
      setError('Please select a step');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      let endpoint = '';
      let method = 'POST';
      let body: any = {};

      switch (action) {
        case 'complete_step':
          endpoint = `/api/leads/${leadId}/steps/${selectedStepId}/complete`;
          body = { remarks: remarks || 'Admin override completion', admin_override: true };
          break;

        case 'reopen_step':
          endpoint = `/api/leads/${leadId}/steps/${selectedStepId}/reopen`;
          body = { admin_override: true };
          break;

        case 'skip_step':
          // Skip by marking as completed with skip flag
          endpoint = `/api/leads/${leadId}/steps/${selectedStepId}/complete`;
          body = { 
            remarks: remarks || 'Admin override - step skipped', 
            admin_override: true,
            skipped: true 
          };
          break;

        case 'move_forward':
          // Move forward by completing current step and all previous pending steps
          endpoint = `/api/leads/${leadId}/admin/move-forward`;
          method = 'POST';
          body = { step_id: selectedStepId, remarks: remarks || 'Admin override - moved forward' };
          break;

        case 'move_backward':
          // Move backward by reopening this step and all subsequent steps
          endpoint = `/api/leads/${leadId}/admin/move-backward`;
          method = 'POST';
          body = { step_id: selectedStepId, remarks: remarks || 'Admin override - moved backward' };
          break;

        case 'reopen_project':
          // Reopen a closed project
          endpoint = `/api/leads/${leadId}`;
          method = 'PATCH';
          body = { status: 'ongoing' };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Override operation failed');
      }

      setSuccess(`Successfully executed ${action.replace('_', ' ')}`);
      setRemarks('');
      
      // Refresh the timeline
      setTimeout(() => {
        onOverrideComplete();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'complete_step':
        return 'Mark the selected step as completed, bypassing all validation requirements.';
      case 'reopen_step':
        return 'Reopen a completed step, allowing it to be modified or completed again.';
      case 'skip_step':
        return 'Skip the selected step entirely, marking it as completed without actual completion.';
      case 'move_forward':
        return 'Complete all steps up to and including the selected step, moving the timeline forward.';
      case 'move_backward':
        return 'Reopen the selected step and all subsequent steps, moving the timeline backward.';
      case 'reopen_project':
        return 'Reopen a closed project, changing its status back to "Ongoing" and allowing timeline modifications.';
      default:
        return '';
    }
  };

  const canPerformAction = () => {
    // Project reopening doesn't require a step selection
    if (action === 'reopen_project') {
      return isProjectClosed;
    }

    if (!selectedStep) return false;

    switch (action) {
      case 'complete_step':
      case 'skip_step':
        return selectedStep.status !== 'completed';
      case 'reopen_step':
        return selectedStep.status === 'completed';
      case 'move_forward':
      case 'move_backward':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      {/* Warning Header */}
      <div className="flex items-start space-x-3 mb-6">
        <svg
          className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-red-900">Admin Override Controls</h3>
          <p className="text-sm text-red-700 mt-1">
            These controls bypass all system restrictions and validations. Use with extreme caution.
            All override actions are logged in the activity log.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Project Status Alert */}
        {isProjectClosed && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  This project is currently closed
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Use the "Reopen Project" action to change the status back to "Ongoing" and allow modifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Selection */}
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-900 mb-2">
            Override Action
          </label>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value as OverrideAction)}
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="complete_step">Complete Step (Bypass Validation)</option>
            <option value="reopen_step">Reopen Completed Step</option>
            <option value="skip_step">Skip Step</option>
            <option value="move_forward">Move Timeline Forward</option>
            <option value="move_backward">Move Timeline Backward</option>
            <option value="reopen_project">Reopen Closed Project</option>
          </select>
          <p className="mt-2 text-sm text-gray-700">{getActionDescription()}</p>
        </div>

        {/* Step Selection - Only show if action requires a step */}
        {action !== 'reopen_project' && (
          <div>
            <label htmlFor="step" className="block text-sm font-medium text-gray-900 mb-2">
              Select Step
            </label>
            <select
              id="step"
              value={selectedStepId}
              onChange={(e) => setSelectedStepId(e.target.value)}
              disabled={isLoading}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Select a step --</option>
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.order_index}. {step.step_name} ({step.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-900 mb-2">
            Remarks (Optional)
          </label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="Enter reason for override action..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-600">
            Provide context for this override action. This will be recorded in the activity log.
          </p>
        </div>

        {/* Selected Step Info */}
        {selectedStep && (
          <div className="bg-white border border-gray-300 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Step Details</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-600">Step Name:</dt>
              <dd className="text-gray-900 font-medium">{selectedStep.step_name}</dd>
              
              <dt className="text-gray-600">Order:</dt>
              <dd className="text-gray-900">{selectedStep.order_index}</dd>
              
              <dt className="text-gray-600">Current Status:</dt>
              <dd>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selectedStep.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedStep.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedStep.status}
                </span>
              </dd>
              
              {selectedStep.completed_at && (
                <>
                  <dt className="text-gray-600">Completed At:</dt>
                  <dd className="text-gray-900">
                    {new Date(selectedStep.completed_at).toLocaleString()}
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-red-200">
          <div className="text-sm text-gray-700">
            {!canPerformAction() && action !== 'reopen_project' && selectedStep && (
              <span className="text-red-600">
                ⚠ This action cannot be performed on a {selectedStep.status} step
              </span>
            )}
            {!canPerformAction() && action === 'reopen_project' && !isProjectClosed && (
              <span className="text-red-600">
                ⚠ This project is not closed
              </span>
            )}
          </div>
          <button
            onClick={handleOverride}
            disabled={isLoading || !canPerformAction()}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Execute Override'
            )}
          </button>
        </div>
      </div>

      {/* Warning Footer */}
      <div className="mt-6 pt-4 border-t border-red-200">
        <p className="text-xs text-red-700">
          <strong>Warning:</strong> Override actions bypass all business logic, validation rules, and permission checks.
          They should only be used in exceptional circumstances. All actions are permanently logged and auditable.
        </p>
      </div>
    </div>
  );
}
