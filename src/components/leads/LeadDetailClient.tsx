/**
 * Lead Detail Client Component
 * 
 * Client-side wrapper for lead detail page with timeline and forms.
 * Uses PageLayout and Card components for consistent structure.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timeline } from '@/components/timeline/Timeline';
import { DocumentListContainer } from '@/components/documents/DocumentListContainer';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Lead } from '@/types/api';
import { useRouter } from 'next/navigation';
import type { TimelineStepData } from '@/components/timeline/TimelineStep';

interface LeadDetailClientProps {
  lead: Lead & {
    created_by_user?: { id: string; name: string; email: string } | null;
    customer_account?: { id: string; name: string; email: string; phone: string; customer_id: string | null } | null;
    installer?: { id: string; name: string; phone: string } | null;
  };
  userRole: string;
  userId?: string;
  backUrl?: string;
  backLabel?: string;
}

export function LeadDetailClient({ 
  lead, 
  userRole, 
  userId,
  backUrl = '/office/leads',
  backLabel = 'Back to All Leads'
}: LeadDetailClientProps) {
  const router = useRouter();
  const [timelineSteps, setTimelineSteps] = useState<TimelineStepData[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);

  useEffect(() => {
    fetchTimelineSteps();
  }, [lead.id]);

  const fetchTimelineSteps = async () => {
    try {
      setIsLoadingSteps(true);
      const response = await fetch(`/api/leads/${lead.id}/steps`);
      if (response.ok) {
        const data = await response.json();
        setTimelineSteps(data.steps || []);
      }
    } catch (error) {
      console.error('Error fetching timeline steps:', error);
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const handleStatusChange = () => {
    router.refresh();
    fetchTimelineSteps();
  };

  return (
    <PageLayout
      title={lead.customer_name}
      description={
        lead.customer_account?.customer_id
          ? `Customer ID: ${lead.customer_account.customer_id}`
          : `Lead ID: ${lead.id}`
      }
      breadcrumbs={[
        { label: backLabel, href: backUrl },
        { label: lead.customer_name },
      ]}
      actions={<LeadStatusBadge status={lead.status} />}
    >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Customer Name</dt>
                  <dd className="mt-1 text-sm">{lead.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="mt-1 text-sm">{lead.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm">{lead.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                  <dd className="mt-1 text-sm capitalize">{lead.source}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="mt-1 text-sm">{lead.address}</dd>
                </div>
                {lead.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd className="mt-1 text-sm">{lead.notes}</dd>
                  </div>
                )}
                {lead.created_by_user && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                    <dd className="mt-1 text-sm">{lead.created_by_user.name}</dd>
                  </div>
                )}
                {lead.installer && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Assigned Installer</dt>
                    <dd className="mt-1 text-sm">
                      {lead.installer.name} ({lead.installer.phone})
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                  <dd className="mt-1 text-sm">
                    {lead.created_at ? new Date(lead.created_at).toLocaleString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentListContainer leadId={lead.id} userRole={userRole} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Edit Lead Button - For agents editing their own leads */}
              {userRole === 'agent' && (
                <Button asChild className="w-full">
                  <Link href={`/agent/leads/${lead.id}/edit`}>
                    Edit Lead
                  </Link>
                </Button>
              )}

              {/* Mark as Interested Button */}
              {lead.status === 'lead' && ['admin', 'office', 'agent'].includes(userRole) && (
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    if (confirm('Mark this lead as interested? This means the customer has agreed to proceed.')) {
                      try {
                        const response = await fetch(`/api/leads/${lead.id}/status`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            status: 'lead_interested',
                            remarks: 'Customer agreed to proceed with solar installation',
                          }),
                        });
                        if (response.ok) {
                          handleStatusChange();
                        } else {
                          alert('Failed to update status');
                        }
                      } catch (error) {
                        alert('Error updating status');
                      }
                    }
                  }}
                >
                  Mark as Interested
                </Button>
              )}
              
              {/* Fill Customer Form Button */}
              {(lead.status === 'lead' || lead.status === 'lead_interested') && (
                <Button asChild className="w-full">
                  <Link href={`/customer/profile/new?leadId=${lead.id}`}>
                    Fill Customer Profile Form
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <a href={`tel:${lead.phone}`}>
                  Call Customer
                </a>
              </Button>
              
              {lead.email && (
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${lead.email}`}>
                    Email Customer
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer Account Info */}
          {lead.customer_account && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Customer Account</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="mt-1 text-sm">{lead.customer_account.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1 text-sm">{lead.customer_account.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="mt-1 text-sm">{lead.customer_account.phone}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Timeline - Full Width Section */}
      <div className="mt-8">
        {isLoadingSteps ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Timeline 
            leadId={lead.id} 
            userRole={userRole}
            userId={userId || ''}
            leadStatus={lead.status}
            initialSteps={timelineSteps}
            onStepComplete={fetchTimelineSteps}
          />
        )}
      </div>
    </PageLayout>
  );
}
