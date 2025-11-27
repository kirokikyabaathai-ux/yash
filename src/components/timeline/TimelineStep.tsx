/**
 * Timeline Step Component
 * 
 * Displays individual timeline step with status and actions.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import type { StepStatus, UserRole } from '@/types/database';

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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return (
          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'pending':
        return (
          <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
    <div className={`border-2 rounded-lg p-6 ${getStatusColor()} transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-800 text-sm font-medium border-2">
                {step.order_index}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">{step.step_name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  step.status === 'completed'
                    ? 'bg-green-200 text-green-900'
                    : step.status === 'pending'
                    ? 'bg-yellow-200 text-yellow-900'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
              </span>
            </div>

            {/* Completion Details */}
            {step.status === 'completed' && (
              <div className="mt-3 space-y-1 text-sm">
                {step.completed_at && (
                  <p className="text-gray-700">
                    <span className="font-medium">Completed:</span> {formatDate(step.completed_at)}
                  </p>
                )}
                {step.completed_by_name && (
                  <p className="text-gray-700">
                    <span className="font-medium">By:</span> {step.completed_by_name}
                  </p>
                )}
                {step.remarks && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Remarks:</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{step.remarks}</p>
                  </div>
                )}
                {step.attachments && step.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Attachments:</p>
                    <ul className="mt-1 space-y-1">
                      {step.attachments.map((attachment, index) => (
                        <li key={index} className="text-blue-600 hover:underline">
                          <a href={attachment} target="_blank" rel="noopener noreferrer">
                            Attachment {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Requirements */}
            {step.status !== 'completed' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.remarks_required && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border">
                    Remarks Required
                  </span>
                )}
                {step.attachments_allowed && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border">
                    Attachments Allowed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {step.status === 'pending' && step.customer_upload && onUpload && (
            <button
              onClick={() => onUpload(step.step_id)}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          )}

          {step.status === 'pending' && canComplete && (
            <button
              onClick={() => onComplete(step.id)}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          )}

          {step.status === 'completed' && canEdit && (
            <button
              onClick={() => onReopen(step.id)}
              disabled={isLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
