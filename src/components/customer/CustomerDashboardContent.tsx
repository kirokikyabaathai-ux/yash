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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-card shadow-md rounded-lg p-6 border border-border">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Welcome, {user.name}!
              </h1>
              <div className="bg-accent border border-accent-foreground/20 rounded-md p-4">
                <p className="text-sm text-accent-foreground">
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-card shadow-md rounded-lg p-6 mb-6 border border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your solar installation project progress
            </p>
          </div>

          {/* Lead Information */}
          <div className="bg-card shadow-md rounded-lg p-6 mb-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Project Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(lead as any).customer_account?.customer_id && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                  <p className="mt-1 text-sm text-foreground font-mono">{(lead as any).customer_account.customer_id}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                <p className="mt-1 text-sm text-foreground">{lead.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1 text-sm text-foreground">{lead.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1 text-sm text-foreground">{lead.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="mt-1">
                  <LeadStatusBadge status={lead.status as any} />
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="mt-1 text-sm text-foreground">{lead.address}</p>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-card shadow-md rounded-lg p-6 mb-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Status Updates
            </h2>
            <StatusHistory leadId={lead.id} />
          </div>

          {/* Tabs */}
          <div className="bg-card shadow-md rounded-lg border border-border">
            <div className="border-b border-border">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setSelectedTab('timeline')}
                  className={`${
                    selectedTab === 'timeline'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setSelectedTab('documents')}
                  className={`${
                    selectedTab === 'documents'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
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
        <p className="text-sm text-muted-foreground">No timeline steps available yet.</p>
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
            className={`border rounded-lg p-4 transition-colors ${
              isCompleted ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
              isPending ? 'border-accent bg-accent/50' :
              'border-border bg-muted/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium shadow-sm ${
                    isCompleted ? 'bg-green-500 text-white dark:bg-green-600' :
                    isPending ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <h3 className="ml-3 text-base font-medium text-foreground">
                    {stepMaster.step_name}
                  </h3>
                </div>
                
                {step.remarks && (
                  <div className="mt-2 ml-11">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Remarks:</span> {step.remarks}
                    </p>
                  </div>
                )}

                {isCompleted && step.completed_at && (
                  <div className="mt-2 ml-11 text-sm text-muted-foreground">
                    <p>
                      Completed on {new Date(step.completed_at).toLocaleDateString()} 
                      {step.completed_by_user && ` by ${step.completed_by_user.name}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  isPending ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
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
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring shadow-sm transition-colors"
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
        <p className="text-sm text-muted-foreground mb-4">No documents uploaded yet.</p>
        <a
          href="/customer/profile/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring shadow-sm transition-colors"
        >
          Upload Documents
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">Uploaded Documents</h3>
        <a
          href="/customer/profile/new"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring shadow-sm transition-colors"
        >
          Upload New Documents
        </a>
      </div>

      <div className="overflow-hidden shadow-md ring-1 ring-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">
                Document Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Category
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                Uploaded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                  {doc.file_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                  {doc.document_category.replace('_', ' ').toUpperCase()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.status === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    doc.status === 'corrupted' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                  {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
