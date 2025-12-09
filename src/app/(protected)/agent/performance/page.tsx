/**
 * Agent Performance Page
 * Detailed performance metrics and analytics for the agent
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Card } from '@/components/ui/organisms/Card';
import { DataTable, Column } from '@/components/ui/organisms/DataTable';
import { ProgressBar } from '@/components/ui/molecules/ProgressBar';
import { Users, TrendingUp, Target, Activity } from 'lucide-react';

export default async function AgentPerformancePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/');
  }

  // Fetch metrics
  const metricsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/api/dashboard/metrics`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  let metrics = null;
  if (metricsResponse.ok) {
    metrics = await metricsResponse.json();
  }

  // Get leads by month for trend analysis
  const { data: leads } = await supabase
    .from('leads')
    .select('created_at, status')
    .order('created_at', { ascending: true });

  // Calculate monthly trends
  const monthlyData: { [key: string]: { total: number; closed: number } } = {};
  leads?.forEach((lead) => {
    if (!lead.created_at) return;
    const month = new Date(lead.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, closed: 0 };
    }
    monthlyData[month].total++;
    if (lead.status === 'lead_completed') {
      monthlyData[month].closed++;
    }
  });

  // Transform monthly data for DataTable
  type MonthlyTrend = {
    month: string;
    total: number;
    closed: number;
    conversionRate: number;
  };

  const monthlyTrends: MonthlyTrend[] = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    total: data.total,
    closed: data.closed,
    conversionRate: data.total > 0 ? (data.closed / data.total) * 100 : 0,
  }));

  // Define columns for monthly trends table
  const monthlyTrendsColumns: Column<MonthlyTrend>[] = [
    {
      key: 'month',
      header: 'Month',
      sortable: true,
    },
    {
      key: 'total',
      header: 'Total Leads',
      sortable: true,
    },
    {
      key: 'closed',
      header: 'Closed Deals',
      sortable: true,
    },
    {
      key: 'conversionRate',
      header: 'Conversion Rate',
      sortable: true,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="My Performance"
          description="Detailed analytics and performance metrics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/agent/dashboard' },
            { label: 'Performance' },
          ]}
        >
          {metrics && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title="Total Leads"
                  value={metrics.totalLeads}
                  description="All time"
                  icon={<Users className="h-4 w-4" />}
                />

                <DashboardCard
                  title="Conversion Rate"
                  value={`${metrics.conversionRate.overallConversion.toFixed(1)}%`}
                  description="Ongoing → Closed"
                  icon={<TrendingUp className="h-4 w-4" />}
                />

                <DashboardCard
                  title="Success Rate"
                  value={`${metrics.conversionRate.interestedToClosed.toFixed(1)}%`}
                  description="Interested → Closed"
                  icon={<Target className="h-4 w-4" />}
                />

                <DashboardCard
                  title="Active Leads"
                  value={metrics.leadsByStatus.ongoing + metrics.leadsByStatus.interested}
                  description="Ongoing + Interested"
                  icon={<Activity className="h-4 w-4" />}
                />
              </div>

              {/* Status Breakdown */}
              <Card
                header={{ title: 'Lead Status Breakdown' }}
                padding="lg"
              >
                <div className="space-y-6">
                  <ProgressBar
                    label="Ongoing"
                    value={(metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100}
                    colorScheme="primary"
                    size="md"
                  />

                  <ProgressBar
                    label="Interested"
                    value={(metrics.leadsByStatus.interested / metrics.totalLeads) * 100}
                    colorScheme="success"
                    size="md"
                  />

                  <ProgressBar
                    label="Closed"
                    value={(metrics.leadsByStatus.closed / metrics.totalLeads) * 100}
                    colorScheme="info"
                    size="md"
                  />

                  <ProgressBar
                    label="Not Interested"
                    value={(metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100}
                    colorScheme="error"
                    size="md"
                  />
                </div>
              </Card>

              {/* Monthly Trends */}
              <Card
                header={{ title: 'Monthly Performance Trends' }}
                padding="none"
              >
                <DataTable
                  columns={monthlyTrendsColumns}
                  data={monthlyTrends}
                  sortable
                  keyExtractor={(row) => row.month}
                  emptyState={
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No monthly data available</p>
                    </div>
                  }
                />
              </Card>
            </div>
          )}
        </PageLayout>
      </div>
    </div>
  );
}
