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
import { auth } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Users, TrendingUp, CheckCircle, Activity } from 'lucide-react';

export default async function AgentDashboardPage() {
  // Get the current session using NextAuth
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const supabase = await createClient();

  // Get user profile from Supabase using session user ID
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    redirect('/');
  }

  // Verify user is an agent
  if (profile.role !== 'agent') {
    redirect('/');
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
        <PageLayout
          title="Agent Dashboard"
          description={`Welcome back, ${profile.name}`}
        >
          {/* Metrics Grid */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="My Total Leads"
                value={metrics.totalLeads}
                icon={<Users className="h-4 w-4" />}
              />

              <DashboardCard
                title="Inquired"
                value={metrics.leadsByStatus.ongoing}
                description="New inquiries"
                icon={<Activity className="h-4 w-4" />}
              />

              <DashboardCard
                title="Interested"
                value={metrics.leadsByStatus.interested}
                icon={<TrendingUp className="h-4 w-4" />}
              />

              <DashboardCard
                title="Completed"
                value={metrics.leadsByStatus.closed}
                icon={<CheckCircle className="h-4 w-4" />}
              />

              <DashboardCard
                title="Conversion Rate"
                value={`${metrics.conversionRate.overallConversion.toFixed(1)}%`}
                description="Completed / Total leads"
              />

              <DashboardCard
                title="Processing"
                value={metrics.leadsByStatus.processing}
                description="Being processed"
              />

              <DashboardCard
                title="Success Rate"
                value={`${metrics.conversionRate.interestedToClosed.toFixed(1)}%`}
                description="Completed / In Progress"
              />

              <DashboardCard
                title="Active Leads"
                value={metrics.activeLeads}
                description="Currently processing"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/agent/leads/new">
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle>Create New Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add a new installation lead
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agent/leads">
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle>My Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View and manage all my leads
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agent/performance">
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle>My Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View detailed performance metrics
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Performance Summary */}
          {metrics && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>My Performance</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* My Pending Leads */}
          <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>My Pending Leads</CardTitle>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
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
                    <tr key={lead.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-normal text-muted-foreground">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-normal text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm font-normal text-muted-foreground">
                      No pending leads
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>My Recent Leads</CardTitle>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
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
                    <tr key={lead.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-normal text-muted-foreground">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-normal text-muted-foreground max-w-xs truncate">
                          {lead.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-normal text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/agent/leads/${lead.id}`}
                          className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm font-normal text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
