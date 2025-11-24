/**
 * Timeline Component
 * 
 * Main timeline display showing all steps for a lead.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import { useState, useEffect } from 'react';
import { TimelineStep, type TimelineStepData } from './TimelineStep';
import { StepCompletionModal } from './StepCompletionModal';

interface TimelineProps {
  leadId: string;
  userRole: string;
  userId: string;
  leadStatus?: string;
  onStepComplete?: () => void;
}

export function Timeline({ leadId, userRole, userId, leadStatus, onStepComplete }: TimelineProps) {
  const [steps, setSteps] = useState<TimelineStepData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<TimelineStepData | null>(null);
  
  // Check if project is closed
  const isProjectClosed = leadStatus === 'closed';
  const canModifyClosedProject = userRole === 'admin';

  useEffect(() => {
    fetchTimeline();
  }, [leadId]);

  const fetchTimeline = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/leads/${leadId}/steps`);

      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setSteps(data.steps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

      await fetchTimeline();
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

      await fetchTimeline();
      
      if (onStepComplete) {
        onStepComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpload = (stepId: string) => {
    // This would typically open a document upload modal
    // For now, we'll just log it
    console.log('Upload for step:', stepId);
    // TODO: Implement document upload modal
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Project Timeline</h2>
        <p className="mt-1 text-sm text-gray-600">
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

      {/* Timeline Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <TimelineStep
            key={step.id}
            step={step}
            canEdit={canEditStep(step)}
            canComplete={canCompleteStep(step)}
            onComplete={handleCompleteClick}
            onReopen={handleReopen}
            onUpload={step.customer_upload ? handleUpload : undefined}
            isLoading={isActionLoading}
            isProjectClosed={isProjectClosed}
          />
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {steps.filter((s) => s.status === 'completed').length} / {steps.length}
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
