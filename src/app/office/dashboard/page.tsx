/**
 * Office Dashboard Page
 * 
 * Displays all leads with filtering, pending actions, and metrics.
 * Requirements: 17.1, 17.3, 17.4, 17.5
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

export default async function OfficeDashboardPage() {
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

  // Verify user is office team
  if (profile.role !== 'office') {
    redirect('/login');
  }

  // Fetch all data in parallel for better performance
  const [
    { data: allLeads },
    { data: leads },
    { data: pendingLeads }
  ] = await Promise.all([
    // Get all leads for metrics calculation
    supabase.from('leads').select('status, created_at'),
    // Get recent leads for display
    supabase
      .from('leads')
      .select(`
        *,
        created_by_user:created_by (
          id,
          name
        ),
        customer_account:customer_account_id (
          id,
          name
        ),
        installer:installer_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(15),
    // Get pending leads
    supabase
      .from('leads')
      .select('*')
      .in('status', ['lead', 'lead_interested', 'lead_processing'])
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // Calculate metrics from the data
  const metrics = allLeads ? {
    totalLeads: allLeads.length,
    leadsByStatus: {
      lead: allLeads.filter(l => l.status === 'lead').length,
      lead_interested: allLeads.filter(l => l.status === 'lead_interested').length,
      lead_processing: allLeads.filter(l => l.status === 'lead_processing').length,
      lead_completed: allLeads.filter(l => l.status === 'lead_completed').length,
      lead_cancelled: allLeads.filter(l => l.status === 'lead_cancelled').length,
    },
    conversionRate: {
      overallConversion: allLeads.length > 0 
        ? (allLeads.filter(l => l.status === 'lead_completed').length / allLeads.length) * 100 
        : 0,
      ongoingToInterested: allLeads.filter(l => l.status === 'lead').length > 0
        ? (allLeads.filter(l => l.status === 'lead_interested').length / allLeads.filter(l => l.status === 'lead').length) * 100
        : 0,
      interestedToClosed: allLeads.filter(l => l.status === 'lead_interested').length > 0
        ? (allLeads.filter(l => l.status === 'lead_completed').length / allLeads.filter(l => l.status === 'lead_interested').length) * 100
        : 0,
    },
    pendingActions: pendingLeads?.length || 0,
    leadsByStep: {},
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Office Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Leads</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {metrics.totalLeads}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">New Lead</div>
              <div className="mt-2 text-3xl font-bold text-blue-600">
                {metrics.leadsByStatus.lead || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Lead Processing</div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {metrics.leadsByStatus.lead_processing || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="mt-2 text-3xl font-bold text-purple-600">
                {metrics.leadsByStatus.lead_completed || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
              <div className="mt-2 text-3xl font-bold text-indigo-600">
                {metrics.conversionRate.overallConversion.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Pending Actions</div>
              <div className="mt-2 text-3xl font-bold text-orange-600">
                {metrics.pendingActions}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Inquiry → Application</div>
              <div className="mt-2 text-3xl font-bold text-teal-600">
                {metrics.conversionRate.ongoingToInterested?.toFixed(1) || 0}%
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Application → Completed</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">
                {metrics.conversionRate.interestedToClosed?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
        )}

        {/* Leads by Current Step */}
        {metrics && Object.keys(metrics.leadsByStep).length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Leads by Current Step
            </h2>
            <div className="space-y-3">
              {Object.entries(metrics.leadsByStep).map(([stepName, count]: [string, any]) => (
                <div key={stepName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stepName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Leads */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Leads (Active)
            </h2>
            <Link
              href="/office/leads"
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
                          href={`/office/leads/${lead.id}`}
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

        {/* All Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Leads</h2>
            <Link
              href="/office/leads"
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
                    Created By
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {lead.created_by_user?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/office/leads/${lead.id}`}
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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/office/leads/new"
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
            href="/office/leads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Leads
            </h3>
            <p className="text-sm text-gray-600">
              View and manage all leads
            </p>
          </Link>

          <Link
            href="/office/reports"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Reports
            </h3>
            <p className="text-sm text-gray-600">
              Generate and view reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
