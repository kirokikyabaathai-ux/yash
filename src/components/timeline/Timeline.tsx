/**
 * Timeline Component
 * 
 * Main timeline display showing all steps for a lead.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import React, { useState } from 'react';
import { type TimelineStepData } from './TimelineStep';
import { StepCompletionModal } from './StepCompletionModal';

interface TimelineProps {
  leadId: string;
  userRole: string;
  userId: string;
  leadStatus?: string;
  initialSteps?: TimelineStepData[];
  onStepComplete?: () => void;
}

export function Timeline({ leadId, userRole, leadStatus, initialSteps = [], onStepComplete }: TimelineProps) {
  const steps = initialSteps;
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<TimelineStepData | null>(null);
  
  // Check if project is closed
  const isProjectClosed = leadStatus === 'completed';
  const canModifyClosedProject = userRole === 'admin';

  const canEditStep = (step: TimelineStepData): boolean => {
    // If project is closed, only admin can edit
    if (isProjectClosed && !canModifyClosedProject) return false;
    
    // Admin can edit any step
    if (userRole === 'admin') return true;

    // Check if user's role is in allowed_roles
    return step.allowed_roles.includes(userRole as any);
  };

  const canCompleteStep = (step: TimelineStepData): boolean => {
    // If project is closed, only admin can complete steps
    if (isProjectClosed && !canModifyClosedProject) return false;
    
    // Only pending steps can be completed
    if (step.status !== 'pending') return false;

    return canEditStep(step);
  };

  const handleCompleteClick = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      setCompletingStep(step);
    }
  };

  const handleCompleteSubmit = async (data: { remarks?: string; attachments?: string[] }) => {
    if (!completingStep) return;

    try {
      setIsActionLoading(true);
      setError(null);

      const response = await fetch(`/api/leads/${leadId}/steps/${completingStep.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to complete step');
      }

      setCompletingStep(null);
      
      if (onStepComplete) {
        onStepComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReopen = async (stepId: string) => {
    if (!window.confirm('Are you sure you want to reopen this step?')) {
      return;
    }

    try {
      setIsActionLoading(true);
      setError(null);

      const response = await fetch(`/api/leads/${leadId}/steps/${stepId}/reopen`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reopen step');
      }

      if (onStepComplete) {
        onStepComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline steps</h3>
        <p className="mt-1 text-sm text-gray-500">
          Timeline steps have not been configured for this lead yet.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-300';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header with Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Timeline</h2>
          <p className="text-sm text-gray-600">
            Track the progress of your solar installation project through each step.
          </p>
          {isProjectClosed && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Project Status:</strong> Closed
                {!canModifyClosedProject && (
                  <span className="block mt-1 text-gray-600">
                    This project is closed. Timeline modifications are restricted. Only an admin can reopen this project.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Complete Next Step Button */}
        {(() => {
          const nextStepIndex = steps.findIndex((s) => s.status === 'pending');
          if (nextStepIndex === -1) return null;
          
          const nextStep = steps[nextStepIndex];
          const allPreviousCompleted = steps
            .slice(0, nextStepIndex)
            .every((s) => s.status === 'completed');
          
          if (!allPreviousCompleted) return null;
          if (!canEditStep(nextStep)) return null;
          if (isProjectClosed && !canModifyClosedProject) return null;

          return (
            <button
              onClick={() => handleCompleteClick(nextStep.id)}
              disabled={isActionLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg text-sm font-semibold hover:bg-green-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {isActionLoading ? 'Processing...' : `Complete: ${nextStep.step_name}`}
            </button>
          );
        })()}
      </div>

      {/* Horizontal Timeline - Scrollable */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="relative flex items-start justify-between min-w-max">
          {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full ${getStatusColor(
                  step.status
                )} flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
                  step.status === 'pending' && 
                  steps.slice(0, index).every((s) => s.status === 'completed')
                    ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2'
                    : ''
                }`}
              >
                {step.status === 'completed' && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="mt-4 text-center w-32 min-h-[80px]">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {step.step_name}
                </div>
                {step.completed_at && (
                  <div className="text-xs text-gray-500">
                    {formatDate(step.completed_at)}
                  </div>
                )}
                {step.remarks && (
                  <div className="text-xs text-gray-400 mt-1 italic" title={step.remarks}>
                    {step.remarks}
                  </div>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 relative z-0 mt-3 ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
          ))}
        </div>
      </div>



      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Overall Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.filter((s) => s.status === 'completed').length} / {steps.length} Steps
            </p>
          </div>
          <div className="flex-1 sm:ml-8">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{
                  width: `${(steps.filter((s) => s.status === 'completed').length / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completingStep && (
        <StepCompletionModal
          step={completingStep}
          isOpen={true}
          onClose={() => setCompletingStep(null)}
          onSubmit={handleCompleteSubmit}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
}
