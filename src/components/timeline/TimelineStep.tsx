/**
 * Timeline Step Component
 * 
 * Displays individual timeline step with status and actions.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 15.1, 15.2, 15.3, 15.4, 15.5
 */

'use client';

import type { StepStatus, UserRole } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface StepDocument {
  id: number;
  document_category: string;
  submission_type: 'form' | 'file';
  process_type?: 'submission' | 'verification';
}

export interface TimelineStepData {
  id: string;
  step_id: string;
  step_name: string;
  order_index: number;
  status: StepStatus;
  completed_by: string | null;
  completed_by_name: string | null;
  completed_at: string | null;
  remarks: string | null;
  attachments: string[] | null;
  allowed_roles: UserRole[];
  remarks_required: boolean;
  attachments_allowed: boolean;
  customer_upload: boolean;
  requires_installer_assignment: boolean;
  step_documents?: StepDocument[];
}

interface TimelineStepProps {
  step: TimelineStepData;
  canEdit: boolean;
  canComplete: boolean;
  onComplete: (stepId: string) => void;
  onReopen: (stepId: string) => void;
  onUpload?: (stepId: string) => void;
  isLoading?: boolean;
  isProjectClosed?: boolean;
}

export function TimelineStep({
  step,
  canEdit,
  canComplete,
  onComplete,
  onReopen,
  onUpload,
  isLoading = false,
  isProjectClosed = false,
}: TimelineStepProps) {
  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-accent text-accent-foreground border-accent-foreground/20';
      case 'halted':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'skipped':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'upcoming':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return (
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'pending':
        return (
          <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'halted':
        return (
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className="h-6 w-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      step.status === 'completed' 
        ? 'border-green-300 dark:border-green-800' 
        : step.status === 'halted'
        ? 'border-red-300 dark:border-red-800'
        : step.status === 'skipped'
        ? 'border-orange-300 dark:border-orange-800'
        : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background text-foreground text-sm font-medium border-2 border-border">
                  {step.order_index}
                </span>
                <CardTitle className="text-lg">{step.step_name}</CardTitle>
                <Badge
                  variant={
                    step.status === 'completed'
                      ? 'solid'
                      : step.status === 'pending'
                      ? 'subtle'
                      : 'outline'
                  }
                  className={
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300'
                      : step.status === 'halted'
                      ? 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300'
                      : step.status === 'skipped'
                      ? 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300'
                      : ''
                  }
                >
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </Badge>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {step.status === 'pending' && step.customer_upload && onUpload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpload(step.step_id)}
                disabled={isLoading}
              >
                Upload
              </Button>
            )}

            {step.status === 'pending' && canComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(step.id)}
                disabled={isLoading}
              >
                Complete
              </Button>
            )}

            {(step.status === 'completed' || step.status === 'halted' || step.status === 'skipped') && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReopen(step.id)}
                disabled={isLoading}
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Completion Details */}
      {(step.status === 'completed' || step.status === 'halted' || step.status === 'skipped') && (
        <CardContent>
          <div className="space-y-2 text-sm">
            {step.completed_at && (
              <p className="text-foreground">
                <span className="font-medium">
                  {step.status === 'halted' ? 'Halted:' : step.status === 'skipped' ? 'Skipped:' : 'Completed:'}
                </span> {formatDate(step.completed_at)}
              </p>
            )}
            {step.completed_by_name && (
              <p className="text-foreground">
                <span className="font-medium">By:</span> {step.completed_by_name}
              </p>
            )}
            {step.remarks && (
              <div className="mt-3">
                <p className="font-medium text-foreground">Remarks:</p>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{step.remarks}</p>
              </div>
            )}
            {step.attachments && step.attachments.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-foreground">Attachments:</p>
                <ul className="mt-1 space-y-1">
                  {step.attachments.map((attachment, index) => (
                    <li key={index} className="text-primary hover:underline">
                      <a href={attachment} target="_blank" rel="noopener noreferrer">
                        Attachment {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Requirements */}
      {step.status !== 'completed' && step.status !== 'halted' && step.status !== 'skipped' && (
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {step.remarks_required && (
              <Badge variant="outline">
                Remarks Required
              </Badge>
            )}
            {step.attachments_allowed && (
              <Badge variant="outline">
                Attachments Allowed
              </Badge>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
