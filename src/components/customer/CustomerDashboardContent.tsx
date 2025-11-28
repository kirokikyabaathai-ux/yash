'use client';

/**
 * Customer Dashboard Content Component
 * 
 * Displays the customer's linked lead information, timeline, and document upload options.
 * Requirements: 3.5
 */

import { useState } from 'react';
import Link from 'next/link';
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
}: CustomerDashboardContentProps) {

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

            {/* Fill Customer Form Button */}
            {(lead.status === 'lead' || lead.status === 'lead_interested') && (
              <div className="mt-6 pt-4 border-t border-border">
                <Link
                  href={`/customer/profile/new?leadId=${lead.id}`}
                  className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Fill Customer Profile Form
                </Link>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Complete your profile to proceed with the installation process
                </p>
              </div>
            )}
          </div>

          {/* Status History */}
          <div className="bg-card shadow-md rounded-lg p-6 mb-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Status Updates
            </h2>
            <StatusHistory leadId={lead.id} />
          </div>

          {/* Timeline */}
          <div className="bg-card shadow-md rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Project Timeline
            </h2>
            <TimelineView steps={timelineSteps} />
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


