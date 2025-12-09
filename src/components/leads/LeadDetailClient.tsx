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
import { getPolishedCardClasses, standardTransitions } from '@/lib/design-system/polish';
import { dataDisplayClasses } from '@/lib/design-system/visual-hierarchy';
import { cn } from '@/lib/utils';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <Card className={getPolishedCardClasses()}>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Customer Name</dt>
                  <dd className={dataDisplayClasses.valueLarge}>{lead.customer_name}</dd>
                </div>
                <div className="space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Phone</dt>
                  <dd className={dataDisplayClasses.value}>
                    <a 
                      href={`tel:${lead.phone}`}
                      className={cn("hover:text-primary hover:underline", standardTransitions.colors)}
                    >
                      {lead.phone}
                    </a>
                  </dd>
                </div>
                <div className="space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Email</dt>
                  <dd className={dataDisplayClasses.value}>
                    {lead.email ? (
                      <a 
                        href={`mailto:${lead.email}`}
                        className={cn("hover:text-primary hover:underline", standardTransitions.colors)}
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </dd>
                </div>
                <div className="space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Source</dt>
                  <dd className={cn(dataDisplayClasses.value, "capitalize")}>{lead.source}</dd>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Address</dt>
                  <dd className={dataDisplayClasses.value}>{lead.address}</dd>
                </div>
                {lead.notes && (
                  <div className="md:col-span-2 space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Notes</dt>
                    <dd className={cn(dataDisplayClasses.value, "text-muted-foreground")}>{lead.notes}</dd>
                  </div>
                )}
                {lead.created_by_user && (
                  <div className="space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Created By</dt>
                    <dd className={dataDisplayClasses.value}>{lead.created_by_user.name}</dd>
                  </div>
                )}
                {lead.installer && (
                  <div className="space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Assigned Installer</dt>
                    <dd className={dataDisplayClasses.value}>
                      {lead.installer.name} ({lead.installer.phone})
                    </dd>
                  </div>
                )}
                <div className="space-y-1.5">
                  <dt className={dataDisplayClasses.label}>Created At</dt>
                  <dd className={dataDisplayClasses.value}>
                    {mounted && lead.created_at 
                      ? new Date(lead.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                      : lead.created_at 
                        ? new Date(lead.created_at).toISOString().slice(0, 16).replace('T', ' ')
                        : 'N/A'
                    }
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className={getPolishedCardClasses()}>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentListContainer leadId={lead.id} userRole={userRole} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card className={getPolishedCardClasses()}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Edit Lead Button - For agents editing their own leads */}
              {userRole === 'agent' && (
                <Link href={`/agent/leads/${lead.id}/edit`} className="w-full">
                  <Button className="w-full">
                    Edit Lead
                  </Button>
                </Link>
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
              
              <a href={`tel:${lead.phone}`} className="w-full block">
                <Button variant="outline" className="w-full">
                  Call Customer
                </Button>
              </a>
              
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="w-full block">
                  <Button variant="outline" className="w-full">
                    Email Customer
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Customer Account Info */}
          {lead.customer_account && (
            <Card className={getPolishedCardClasses()}>
              <CardHeader>
                <CardTitle>Customer Account</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Name</dt>
                    <dd className={dataDisplayClasses.value}>{lead.customer_account.name}</dd>
                  </div>
                  <div className="space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Email</dt>
                    <dd className={dataDisplayClasses.value}>
                      <a 
                        href={`mailto:${lead.customer_account.email}`}
                        className={cn("hover:text-primary hover:underline", standardTransitions.colors)}
                      >
                        {lead.customer_account.email}
                      </a>
                    </dd>
                  </div>
                  <div className="space-y-1.5">
                    <dt className={dataDisplayClasses.label}>Phone</dt>
                    <dd className={dataDisplayClasses.value}>
                      <a 
                        href={`tel:${lead.customer_account.phone}`}
                        className={cn("hover:text-primary hover:underline", standardTransitions.colors)}
                      >
                        {lead.customer_account.phone}
                      </a>
                    </dd>
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
