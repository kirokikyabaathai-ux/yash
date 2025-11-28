/**
 * Office Reports Client Component
 */

'use client';

import { useState, useEffect } from 'react';

interface ReportMetrics {
  totalLeads: number;
  leadsByStatus: {
    ongoing: number;
    interested: number;
    closed: number;
    not_interested: number;
  };
  conversionRate: {
    overallConversion: number;
    ongoingToInterested: number;
    interestedToClosed: number;
  };
  leadsByStep: Record<string, number>;
  pendingActions: number;
  leadsCreatedThisMonth: number;
  leadsClosedThisMonth: number;
}

export function OfficeReportsClient() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/metrics');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!metrics) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Leads', metrics.totalLeads],
      ['Ongoing Leads', metrics.leadsByStatus.ongoing],
      ['Interested Leads', metrics.leadsByStatus.interested],
      ['Closed Leads', metrics.leadsByStatus.closed],
      ['Not Interested Leads', metrics.leadsByStatus.not_interested],
      ['Overall Conversion Rate', `${metrics.conversionRate.overallConversion.toFixed(2)}%`],
      ['Ongoing to Interested Rate', `${metrics.conversionRate.ongoingToInterested.toFixed(2)}%`],
      ['Interested to Closed Rate', `${metrics.conversionRate.interestedToClosed.toFixed(2)}%`],
      ['Pending Actions', metrics.pendingActions],
      ['Leads Created This Month', metrics.leadsCreatedThisMonth],
      ['Leads Closed This Month', metrics.leadsClosedThisMonth],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-crm-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 max-w-md">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View comprehensive reports and analytics
            </p>
          </div>
          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Export Report
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                To
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Leads</div>
                <div className="mt-2 text-3xl font-bold text-foreground">
                  {metrics.totalLeads}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Ongoing</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.leadsByStatus.ongoing}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Interested</div>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {metrics.leadsByStatus.interested}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Closed</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.leadsByStatus.closed}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.conversionRate.overallConversion.toFixed(1)}%
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Pending Actions</div>
                <div className="mt-2 text-3xl font-bold text-accent-foreground">
                  {metrics.pendingActions}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Created This Month</div>
                <div className="mt-2 text-3xl font-bold text-primary">
                  {metrics.leadsCreatedThisMonth}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="text-sm font-medium text-muted-foreground">Closed This Month</div>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {metrics.leadsClosedThisMonth}
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Conversion Funnel
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Ongoing</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.leadsByStatus.ongoing} leads
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8">
                    <div
                      className="bg-primary h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium"
                      style={{ width: '100%' }}
                    >
                      100%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Interested</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.leadsByStatus.interested} leads
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${metrics.conversionRate.ongoingToInterested}%`,
                      }}
                    >
                      {metrics.conversionRate.ongoingToInterested.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Closed</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.leadsByStatus.closed} leads
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8">
                    <div
                      className="bg-primary h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium"
                      style={{
                        width: `${metrics.conversionRate.interestedToClosed}%`,
                      }}
                    >
                      {metrics.conversionRate.interestedToClosed.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leads by Step */}
            {Object.keys(metrics.leadsByStep).length > 0 && (
              <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Leads by Current Step
                </h2>
                <div className="space-y-3">
                  {Object.entries(metrics.leadsByStep).map(([stepName, count]: [string, any]) => (
                    <div key={stepName} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stepName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
