/**
 * Lead Detail Client Component
 * 
 * Client-side wrapper for lead detail page with timeline and forms.
 * Used by office team to manage leads.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timeline } from '@/components/timeline/Timeline';
import { DocumentListContainer } from '@/components/documents/DocumentListContainer';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import type { Lead } from '@/types/api';
import { useRouter } from 'next/navigation';
import type { TimelineStepData } from '@/components/timeline/TimelineStep';

interface LeadDetailClientProps {
  lead: Lead & {
    created_by_user?: { id: string; name: string; email: string } | null;
    customer_account?: { id: string; name: string; email: string; phone: string } | null;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href={backUrl}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {backLabel}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.customer_name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Lead ID: {lead.id}
            </p>
          </div>
          <LeadStatusBadge status={lead.status} className="text-sm px-3 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lead Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Source</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{lead.source}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.address}</dd>
              </div>
              {lead.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.notes}</dd>
                </div>
              )}
              {lead.created_by_user && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.created_by_user.name}</dd>
                </div>
              )}
              {lead.installer && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Installer</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lead.installer.name} ({lead.installer.phone})
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(lead.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Documents
            </h2>
            <DocumentListContainer leadId={lead.id} userRole={userRole} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {/* Edit Lead Button - For agents editing their own leads */}
              {userRole === 'agent' && (
                <Link
                  href={`/agent/leads/${lead.id}/edit`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                >
                  Edit Lead
                </Link>
              )}

              {/* Mark as Interested Button */}
              {lead.status === 'lead' && ['admin', 'office', 'agent'].includes(userRole) && (
                <button
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
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                >
                  Mark as Interested
                </button>
              )}
              
              {/* Fill Customer Form Button */}
              {(lead.status === 'lead' || lead.status === 'lead_interested') && (
                <Link
                  href={`/customer/profile/new?leadId=${lead.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                >
                  Fill Customer Profile Form
                </Link>
              )}
              
              <a
                href={`tel:${lead.phone}`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Call Customer
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Email Customer
                </a>
              )}
            </div>
          </div>

          {/* Customer Account Info */}
          {lead.customer_account && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Account
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.customer_account.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.customer_account.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.customer_account.phone}</dd>
                </div>
              </dl>
            </div>
          )}


        </div>
      </div>

      {/* Timeline - Full Width Section */}
      <div className="mt-8">
        {isLoadingSteps ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    </div>
  );
}
