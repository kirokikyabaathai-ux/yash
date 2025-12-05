/**
 * Timeline Component
 * 
 * Main timeline display showing all steps for a lead.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 15.1, 15.2, 15.3, 15.4, 15.5
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type TimelineStepData } from './TimelineStep';
import { StepCompletionModal } from './StepCompletionModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimelineProps {
  leadId: string;
  userRole: string;
  userId: string;
  leadStatus?: string;
  leadInstallerId?: string | null;
  initialSteps?: TimelineStepData[];
  onStepComplete?: () => void;
}

export function Timeline({ leadId, userRole, userId, leadStatus, leadInstallerId, initialSteps = [], onStepComplete }: TimelineProps) {
  const [steps, setSteps] = useState<TimelineStepData[]>(initialSteps);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<TimelineStepData | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Check if project is closed
  const isProjectClosed = leadStatus === 'completed';
  const canModifyClosedProject = userRole === 'admin';

  // Scroll to the latest completed step on mount and when steps change
  useEffect(() => {
    const lastCompletedIndex = steps.map(s => s.status).lastIndexOf('completed');
    if (lastCompletedIndex >= 0 && timelineContainerRef.current) {
      const stepId = steps[lastCompletedIndex].id;
      const stepElement = stepRefs.current.get(stepId);
      
      if (stepElement) {
        // Smooth scroll to center the latest completed step
        setTimeout(() => {
          stepElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }, 100);
      }
    }
  }, [steps]);

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

      const result = await response.json();

      // Update the local state with the completed step
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === completingStep.id
            ? {
                ...step,
                status: 'completed' as const,
                completed_by: userId,
                completed_by_name: result.data?.completed_by_name || null,
                completed_at: result.data?.completed_at || new Date().toISOString(),
                remarks: data.remarks || null,
                attachments: data.attachments || null,
              }
            : step
        )
      );

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

      // Update the local state with the reopened step
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                status: 'pending' as const,
                completed_by: null,
                completed_by_name: null,
                completed_at: null,
                remarks: null,
                attachments: null,
              }
            : step
        )
      );

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
      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed border-border">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
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
        <h3 className="mt-2 text-sm font-medium text-foreground">No timeline steps</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Timeline steps have not been configured for this lead yet.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500 dark:bg-green-600' : 'bg-muted';
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Track the progress of your solar installation project through each step.
              </CardDescription>
              {isProjectClosed && (
                <div className="mt-3 p-3 bg-muted border border-border rounded-md">
                  <p className="text-sm text-foreground">
                    <strong>Project Status:</strong> Closed
                    {!canModifyClosedProject && (
                      <span className="block mt-1 text-muted-foreground">
                        This project is closed. Timeline modifications are restricted. Only an admin can reopen this project.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Complete Next Step Button - Hidden for agents */}
            {userRole !== 'agent' && (() => {
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
                <Button
                  onClick={() => handleCompleteClick(nextStep.id)}
                  disabled={isActionLoading}
                  size="lg"
                  className="whitespace-nowrap"
                >
                  {isActionLoading ? 'Processing...' : `Complete: ${nextStep.step_name}`}
                </Button>
              );
            })()}
          </div>
        </CardHeader>
      </Card>

      {/* Horizontal Timeline - Scrollable */}
      <Card>
        <CardContent className="pt-6">
          <div ref={timelineContainerRef} className="overflow-x-auto pb-4">
            <div className="relative flex items-start justify-between min-w-max">
              {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  ref={(el) => {
                    if (el) {
                      stepRefs.current.set(step.id, el);
                    } else {
                      stepRefs.current.delete(step.id);
                    }
                  }}
                  className="flex flex-col items-center relative z-10 flex-shrink-0 group"
                >
                  <div
                    className={`w-6 h-6 rounded-full ${getStatusColor(
                      step.status
                    )} flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer ${
                      step.status === 'pending' && 
                      steps.slice(0, index).every((s) => s.status === 'completed')
                        ? 'animate-pulse ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                  >
                    {step.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="mt-4 text-center w-32 min-h-[80px] transition-transform duration-200 group-hover:scale-105">
                    <div className="font-medium text-sm text-foreground mb-1">
                      {step.step_name}
                    </div>
                    {step.completed_at && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(step.completed_at)}
                      </div>
                    )}
                    {step.remarks && (
                      <div className="text-xs text-muted-foreground/70 mt-1 italic line-clamp-2" title={step.remarks}>
                        {step.remarks}
                      </div>
                    )}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 relative z-0 mt-3 transition-colors duration-300 ${
                      step.status === 'completed'
                        ? 'bg-green-500 dark:bg-green-600'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {steps.filter((s) => s.status === 'completed').length} / {steps.length} Steps
              </p>
            </div>
            <div className="flex-1 sm:ml-8">
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(steps.filter((s) => s.status === 'completed').length / steps.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Modal */}
      {completingStep && (
        <StepCompletionModal
          step={completingStep}
          isOpen={true}
          onClose={() => setCompletingStep(null)}
          onSubmit={handleCompleteSubmit}
          isLoading={isActionLoading}
          leadInstallerId={leadInstallerId}
          leadId={leadId}
        />
      )}
    </div>
  );
}
