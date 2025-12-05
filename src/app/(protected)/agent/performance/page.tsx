/**
 * Agent Performance Page
 * Detailed performance metrics and analytics for the agent
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/agent/dashboard"
            className="text-sm text-primary hover:text-primary/80 mb-4 inline-block transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">My Performance</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Detailed analytics and performance metrics
          </p>
        </div>

        {metrics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Leads</div>
                <div className="mt-2 text-3xl font-bold text-foreground">
                  {metrics.totalLeads}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">All time</div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.conversionRate.overallConversion.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Ongoing → Closed
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {metrics.conversionRate.interestedToClosed.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Interested → Closed
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Active Leads</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.leadsByStatus.ongoing + metrics.leadsByStatus.interested}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Ongoing + Interested
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-card border border-border rounded-lg shadow-sm mb-8 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Lead Status Breakdown
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Ongoing</span>
                    <span className="text-sm font-medium text-foreground">
                      {metrics.leadsByStatus.ongoing} ({((metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${(metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Interested</span>
                    <span className="text-sm font-medium text-foreground">
                      {metrics.leadsByStatus.interested} ({((metrics.leadsByStatus.interested / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-green-600 dark:bg-green-400 h-3 rounded-full transition-all"
                      style={{
                        width: `${(metrics.leadsByStatus.interested / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Closed</span>
                    <span className="text-sm font-medium text-foreground">
                      {metrics.leadsByStatus.closed} ({((metrics.leadsByStatus.closed / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${(metrics.leadsByStatus.closed / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Not Interested</span>
                    <span className="text-sm font-medium text-foreground">
                      {metrics.leadsByStatus.not_interested} ({((metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-red-600 dark:bg-red-400 h-3 rounded-full transition-all"
                      style={{
                        width: `${(metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Monthly Performance Trends
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Leads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Closed Deals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {Object.entries(monthlyData).map(([month, data]) => (
                      <tr key={month} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {data.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {data.closed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {data.total > 0 ? ((data.closed / data.total) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
