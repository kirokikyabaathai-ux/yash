'use client';

/**
 * Customer Dashboard Content Component
 * 
 * Displays the customer's linked lead information, timeline, and document upload options.
 * Requirements: 3.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import Link from 'next/link';
import { Database } from '@/types/database';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { StatusHistory } from './StatusHistory';
import { Timeline } from '@/components/timeline/Timeline';
import type { TimelineStepData } from '@/components/timeline/TimelineStep';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Button } from '@/components/ui/button';

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
            <PageLayout
              title={`Welcome, ${user.name}!`}
              description="Track your solar installation project"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-accent border border-accent-foreground/20 rounded-md p-4">
                    <p className="text-sm text-accent-foreground">
                      No lead is currently linked to your account. Please contact our team to create a lead for your solar installation project.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PageLayout>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageLayout
            title={`Welcome, ${user.name}!`}
            description="Track your solar installation project progress"
          >

            {/* Lead Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(lead as any).customer_account?.customer_id && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                      <p className="text-sm font-mono font-normal text-foreground">{(lead as any).customer_account.customer_id}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                    <p className="text-base font-semibold text-foreground">{lead.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm font-normal text-foreground">{lead.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-normal text-foreground">{lead.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <LeadStatusBadge status={lead.status as any} />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-sm font-normal text-foreground">{lead.address}</p>
                  </div>
                </div>

                {/* Fill Customer Form Button */}
                {(lead.status === 'lead' || lead.status === 'lead_interested') && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs font-normal text-muted-foreground text-center">
                      Complete your profile to proceed with the installation process
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Status Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusHistory leadId={lead.id} />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              {timelineSteps && timelineSteps.length > 0 ? (
                <Timeline
                  leadId={lead.id}
                  userRole="customer"
                  userId={user.id}
                  leadStatus={lead.status}
                  leadInstallerId={lead.installer_id}
                  initialSteps={transformTimelineSteps(timelineSteps)}
                />
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No timeline steps available yet.</p>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </PageLayout>
        </div>
      </div>
    </div>
  );
}

// Transform timeline steps from database format to Timeline component format
function transformTimelineSteps(steps: TimelineStep[]): TimelineStepData[] {
  return steps.map((step) => ({
    id: step.id,
    step_id: step.step_id,
    step_name: step.step_master?.step_name || 'Unknown Step',
    order_index: step.step_master?.order_index || 0,
    status: step.status,
    completed_by: step.completed_by,
    completed_by_name: step.completed_by_user?.name || null,
    completed_at: step.completed_at,
    remarks: step.remarks,
    attachments: step.attachments,
    allowed_roles: (step.step_master?.allowed_roles || []) as any[],
    remarks_required: step.step_master?.remarks_required || false,
    attachments_allowed: step.step_master?.attachments_allowed || false,
    customer_upload: step.step_master?.customer_upload || false,
    requires_installer_assignment: false,
  }));
}


