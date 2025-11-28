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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">My Total Leads</div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {metrics.totalLeads}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Inquired</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                {metrics.leadsByStatus.ongoing}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">New inquiries</p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Interested</div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {metrics.leadsByStatus.interested}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                {metrics.leadsByStatus.closed}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                {metrics.conversionRate.overallConversion.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Completed / Total leads</p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Processing</div>
              <div className="mt-2 text-3xl font-bold text-accent-foreground">
                {metrics.leadsByStatus.processing}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Being processed</p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {metrics.conversionRate.interestedToClosed.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Completed / In Progress</p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Active Leads</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                {metrics.activeLeads}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Currently processing</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/agent/leads/new"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Create New Lead
            </h3>
            <p className="text-sm text-muted-foreground">
              Add a new installation lead
            </p>
          </Link>

          <Link
            href="/agent/leads"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              My Leads
            </h3>
            <p className="text-sm text-muted-foreground">
              View and manage all my leads
            </p>
          </Link>

          <Link
            href="/agent/performance"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              My Performance
            </h3>
            <p className="text-sm text-muted-foreground">
              View detailed performance metrics
            </p>
          </Link>
        </div>

        {/* Performance Summary */}
        {metrics && (
          <div className="bg-card border border-border rounded-lg shadow-sm mb-8 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              My Performance
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ongoing Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {metrics.leadsByStatus.ongoing}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interested Leads</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.interested / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {metrics.leadsByStatus.interested}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Closed Deals</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.closed / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {metrics.leadsByStatus.closed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Pending Leads */}
        <div className="bg-card border border-border rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Pending Leads
            </h2>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {pendingLeads && pendingLeads.length > 0 ? (
                  pendingLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No pending leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">My Recent Leads</h2>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {leads && leads.length > 0 ? (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {lead.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
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
