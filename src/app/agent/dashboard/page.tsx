/**
 * Agent Dashboard Page
 * 
 * Displays only agent's own leads and agent-specific metrics.
 * Requirements: 17.2, 17.3, 17.4, 17.5
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

export default async function AgentDashboardPage() {
  const supabase = await createClient();

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/login');
  }

  // Verify user is an agent
  if (profile.role !== 'agent') {
    redirect('/login');
  }

  // Fetch all data in parallel for better performance
  const [
    { data: allLeads },
    { data: leads },
    { data: pendingLeads }
  ] = await Promise.all([
    // Get all leads for metrics calculation (RLS will automatically filter to agent's leads)
    supabase.from('leads').select('status, created_at'),
    // Get recent leads for display
    supabase
      .from('leads')
      .select(`
        *,
        customer_account:customer_account_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10),
    // Get pending leads
    supabase
      .from('leads')
      .select('*')
      .in('status', ['lead', 'lead_interested', 'lead_processing'])
      .order('created_at', { ascending: false })
  ]);

  // Calculate metrics from the data
  const ongoingCount = allLeads?.filter(l => l.status === 'lead').length || 0;
  const interestedCount = allLeads?.filter(l => l.status === 'lead_interested').length || 0;
  const processingCount = allLeads?.filter(l => l.status === 'lead_processing').length || 0;
  const completedCount = allLeads?.filter(l => l.status === 'lead_completed').length || 0;
  const cancelledCount = allLeads?.filter(l => l.status === 'lead_cancelled').length || 0;
  const totalCount = allLeads?.length || 0;

  const metrics = allLeads ? {
    totalLeads: totalCount,
    leadsByStatus: {
      ongoing: ongoingCount,
      interested: interestedCount,
      processing: processingCount,
      closed: completedCount,
      not_interested: cancelledCount,
    },
    conversionRate: {
      // Overall conversion: completed leads / all leads (including cancelled)
      overallConversion: totalCount > 0 
        ? (completedCount / totalCount) * 100 
        : 0,
      // Conversion from new leads to interested
      ongoingToInterested: ongoingCount > 0
        ? (interestedCount / ongoingCount) * 100
        : 0,
      // Success rate: completed / (interested + processing) - how well you close interested leads
      interestedToClosed: (interestedCount + processingCount) > 0
        ? (completedCount / (interestedCount + processingCount)) * 100
        : 0,
    },
    // Active leads = leads currently being processed/worked on
    activeLeads: processingCount,
    // Pending actions = leads that need immediate attention (ongoing + interested)
    pendingActions: ongoingCount + interestedCount,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">My Total Leads</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {metrics.totalLeads}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Inquired</div>
              <div className="mt-2 text-3xl font-bold text-blue-600">
                {metrics.leadsByStatus.ongoing}
              </div>
              <p className="mt-1 text-xs text-gray-500">New inquiries</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Interested</div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {metrics.leadsByStatus.interested}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="mt-2 text-3xl font-bold text-purple-600">
                {metrics.leadsByStatus.closed}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
              <div className="mt-2 text-3xl font-bold text-indigo-600">
                {metrics.conversionRate.overallConversion.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-gray-500">Completed / Total leads</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Processing</div>
              <div className="mt-2 text-3xl font-bold text-orange-600">
                {metrics.leadsByStatus.processing}
              </div>
              <p className="mt-1 text-xs text-gray-500">Being processed</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Success Rate</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">
                {metrics.conversionRate.interestedToClosed.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-gray-500">Completed / In Progress</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Active Leads</div>
              <div className="mt-2 text-3xl font-bold text-teal-600">
                {metrics.activeLeads}
              </div>
              <p className="mt-1 text-xs text-gray-500">Currently processing</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/agent/leads/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create New Lead
            </h3>
            <p className="text-sm text-gray-600">
              Add a new solar installation lead
            </p>
          </Link>

          <Link
            href="/agent/leads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Leads
            </h3>
            <p className="text-sm text-gray-600">
              View and manage all my leads
            </p>
          </Link>

          <Link
            href="/agent/performance"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Performance
            </h3>
            <p className="text-sm text-gray-600">
              View detailed performance metrics
            </p>
          </Link>
        </div>

        {/* Performance Summary */}
        {metrics && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Performance
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ongoing Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {metrics.leadsByStatus.ongoing}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Interested Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.interested / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {metrics.leadsByStatus.interested}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Closed Deals</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.closed / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {metrics.leadsByStatus.closed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Pending Leads */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              My Pending Leads
            </h2>
            <Link
              href="/agent/leads"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingLeads && pendingLeads.length > 0 ? (
                  pendingLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No pending leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Recent Leads</h2>
            <Link
              href="/agent/leads"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads && leads.length > 0 ? (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {lead.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
