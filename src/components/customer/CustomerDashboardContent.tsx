'use client';

/**
 * Customer Dashboard Content Component
 * 
 * Displays the customer's linked lead information, timeline, and document upload options.
 * Requirements: 3.5
 */

import { useState } from 'react';
import { Database } from '@/types/database';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { StatusHistory } from './StatusHistory';

type User = Database['public']['Tables']['users']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];
type Document = Database['public']['Tables']['documents']['Row'] & {
  uploaded_by_user: { id: string; name: string } | null;
};

interface TimelineStep {
  id: string;
  lead_id: string;
  step_id: string;
  status: 'upcoming' | 'pending' | 'completed';
  completed_by: string | null;
  completed_at: string | null;
  remarks: string | null;
  attachments: string[] | null;
  step_master: {
    id: string;
    step_name: string;
    order_index: number;
    allowed_roles: string[];
    remarks_required: boolean;
    attachments_allowed: boolean;
    customer_upload: boolean;
  } | null;
  completed_by_user: { id: string; name: string } | null;
}

interface CustomerDashboardContentProps {
  user: User;
  lead: Lead | null;
  timelineSteps: TimelineStep[] | null;
  documents: Document[] | null;
}

export function CustomerDashboardContent({
  user,
  lead,
  timelineSteps,
  documents,
}: CustomerDashboardContentProps) {
  const [selectedTab, setSelectedTab] = useState<'timeline' | 'documents'>('timeline');

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user.name}!
              </h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  No lead is currently linked to your account. Please contact our team to create a lead for your solar installation project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm text-gray-600">
              Track your solar installation project progress
            </p>
          </div>

          {/* Lead Information */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(lead as any).customer_account?.customer_id && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer ID</p>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{(lead as any).customer_account.customer_id}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="mt-1 text-sm text-gray-900">{lead.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{lead.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{lead.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1">
                  <LeadStatusBadge status={lead.status} />
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mt-1 text-sm text-gray-900">{lead.address}</p>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Status Updates
            </h2>
            <StatusHistory leadId={lead.id} />
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setSelectedTab('timeline')}
                  className={`${
                    selectedTab === 'timeline'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setSelectedTab('documents')}
                  className={`${
                    selectedTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Documents
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'timeline' && (
                <TimelineView steps={timelineSteps} />
              )}
              {selectedTab === 'documents' && (
                <DocumentsView documents={documents} leadId={lead.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineView({ steps }: { steps: TimelineStep[] | null }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No timeline steps available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const stepMaster = step.step_master;
        if (!stepMaster) return null;

        const isCompleted = step.status === 'completed';
        const isPending = step.status === 'pending';
        const isUpcoming = step.status === 'upcoming';

        return (
          <div
            key={step.id}
            className={`border rounded-lg p-4 ${
              isCompleted ? 'border-green-200 bg-green-50' :
              isPending ? 'border-yellow-200 bg-yellow-50' :
              'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isPending ? 'bg-yellow-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <h3 className="ml-3 text-base font-medium text-gray-900">
                    {stepMaster.step_name}
                  </h3>
                </div>
                
                {step.remarks && (
                  <div className="mt-2 ml-11">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Remarks:</span> {step.remarks}
                    </p>
                  </div>
                )}

                {isCompleted && step.completed_at && (
                  <div className="mt-2 ml-11 text-sm text-gray-500">
                    <p>
                      Completed on {new Date(step.completed_at).toLocaleDateString()} 
                      {step.completed_by_user && ` by ${step.completed_by_user.name}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isCompleted ? 'bg-green-100 text-green-800' :
                  isPending ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Show upload button if customer can upload for this step */}
            {isPending && stepMaster.customer_upload && (
              <div className="mt-4 ml-11">
                <a
                  href="/customer/profile/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Documents
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocumentsView({ documents, leadId }: { documents: Document[] | null; leadId: string }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 mb-4">No documents uploaded yet.</p>
        <a
          href="/customer/profile/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload Documents
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
        <a
          href="/customer/profile/new"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload New Documents
        </a>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Document Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Category
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Uploaded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {doc.file_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {doc.document_category.replace('_', ' ').toUpperCase()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.status === 'valid' ? 'bg-green-100 text-green-800' :
                    doc.status === 'corrupted' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
