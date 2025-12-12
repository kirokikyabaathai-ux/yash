/**
 * Agent Dashboard Page
 * 
 * Displays only agent's own leads and agent-specific metrics.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 17.2, 17.3, 17.4, 17.5
 * Validates: Requirements 6.1, 6.2, 6.3, 9.1, 9.2, 9.3
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { auth } from '@/lib/auth/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { DataTable, type Column } from '@/components/ui/organisms/DataTable';
import { Card, CardGrid } from '@/components/ui/organisms/Card';
import { ProgressBar } from '@/components/ui/molecules/ProgressBar';
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

  // Define columns for pending leads table
  const pendingLeadsColumns: Column<any>[] = [
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <LeadStatusBadge status={value} />,
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value) => (
        <Link
          href={`/agent/leads/${value}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
        >
          View
        </Link>
      ),
    },
  ];

  // Define columns for recent leads table
  const recentLeadsColumns: Column<any>[] = [
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <LeadStatusBadge status={value} />,
    },
    {
      key: 'address',
      header: 'Address',
      render: (value) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value) => (
        <Link
          href={`/agent/leads/${value}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="Agent Dashboard"
          description={`Welcome back, ${profile.name}`}
        >
          {/* Metrics Grid - Responsive layout */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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

          {/* Quick Actions - Using CardGrid */}
          <CardGrid columns={{ sm: 1, md: 3 }} gap="md" className="mb-8">
            <Card
              clickable
              onClick={() => {}}
              header={{
                title: 'Create New Lead',
              }}
            >
              <Link href="/agent/leads/new" className="block">
                <p className="text-sm text-muted-foreground">
                  Add a new installation lead
                </p>
              </Link>
            </Card>

            <Card
              clickable
              onClick={() => {}}
              header={{
                title: 'My Leads',
              }}
            >
              <Link href="/agent/leads" className="block">
                <p className="text-sm text-muted-foreground">
                  View and manage all my leads
                </p>
              </Link>
            </Card>

            <Card
              clickable
              onClick={() => {}}
              header={{
                title: 'My Performance',
              }}
            >
              <Link href="/agent/performance" className="block">
                <p className="text-sm text-muted-foreground">
                  View detailed performance metrics
                </p>
              </Link>
            </Card>
          </CardGrid>

          {/* Performance Summary - Using ProgressBar */}
          {metrics && (
            <Card
              header={{
                title: 'My Performance',
              }}
              className="mb-8"
            >
              <div className="space-y-4">
                <ProgressBar
                  label="Ongoing Leads"
                  value={metrics.totalLeads > 0 ? (metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100 : 0}
                  showPercentage={false}
                  colorScheme="primary"
                />
                <div className="flex justify-end">
                  <span className="text-sm font-medium">
                    {metrics.leadsByStatus.ongoing}
                  </span>
                </div>

                <ProgressBar
                  label="Interested Leads"
                  value={metrics.totalLeads > 0 ? (metrics.leadsByStatus.interested / metrics.totalLeads) * 100 : 0}
                  showPercentage={false}
                  colorScheme="success"
                />
                <div className="flex justify-end">
                  <span className="text-sm font-medium">
                    {metrics.leadsByStatus.interested}
                  </span>
                </div>

                <ProgressBar
                  label="Closed Deals"
                  value={metrics.totalLeads > 0 ? (metrics.leadsByStatus.closed / metrics.totalLeads) * 100 : 0}
                  showPercentage={false}
                  colorScheme="primary"
                />
                <div className="flex justify-end">
                  <span className="text-sm font-medium">
                    {metrics.leadsByStatus.closed}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* My Pending Leads - Using DataTable */}
          <Card
            header={{
              title: 'My Pending Leads',
              actions: (
                <Link
                  href="/agent/leads"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                </Link>
              ),
            }}
            className="mb-8"
            padding="none"
          >
            <DataTable
              columns={pendingLeadsColumns}
              data={pendingLeads || []}
              sortable
              keyExtractor={(row) => row.id}
              emptyState={
                <p className="text-sm text-muted-foreground">No pending leads</p>
              }
            />
          </Card>

          {/* Recent Leads - Using DataTable */}
          <Card
            header={{
              title: 'My Recent Leads',
              actions: (
                <Link
                  href="/agent/leads"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                </Link>
              ),
            }}
            padding="none"
          >
            <DataTable
              columns={recentLeadsColumns}
              data={leads || []}
              sortable
              keyExtractor={(row) => row.id}
              emptyState={
                <p className="text-sm text-muted-foreground">No leads found</p>
              }
            />
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
