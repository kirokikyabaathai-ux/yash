/**
 * Office Reports Client Component
 */

'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Card } from '@/components/ui/organisms/Card';
import { ProgressBar } from '@/components/ui/molecules/ProgressBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Target, 
  AlertCircle, 
  Calendar,
  Download 
} from 'lucide-react';

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
        <PageLayout
          title="Reports & Analytics"
          description="View comprehensive reports and analytics"
          actions={
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          }
        >
          <div className="space-y-8">
            {/* Date Range Filter */}
            <Card
              header={{ title: 'Date Range', icon: <Calendar className="h-4 w-4" /> }}
              padding="lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    From
                  </label>
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    To
                  </label>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Metrics Grid */}
            {metrics && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard
                    title="Total Leads"
                    value={metrics.totalLeads}
                    icon={<Users className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Ongoing"
                    value={metrics.leadsByStatus.ongoing}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Interested"
                    value={metrics.leadsByStatus.interested}
                    icon={<Target className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Closed"
                    value={metrics.leadsByStatus.closed}
                    icon={<CheckCircle className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate.overallConversion.toFixed(1)}%`}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Pending Actions"
                    value={metrics.pendingActions}
                    icon={<AlertCircle className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Created This Month"
                    value={metrics.leadsCreatedThisMonth}
                    icon={<Calendar className="h-4 w-4" />}
                  />

                  <DashboardCard
                    title="Closed This Month"
                    value={metrics.leadsClosedThisMonth}
                    icon={<CheckCircle className="h-4 w-4" />}
                  />
                </div>

                {/* Conversion Funnel */}
                <Card
                  header={{ title: 'Conversion Funnel' }}
                  padding="lg"
                >
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Ongoing</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.leadsByStatus.ongoing} leads
                        </span>
                      </div>
                      <ProgressBar
                        value={100}
                        colorScheme="primary"
                        size="lg"
                        showPercentage={false}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Interested</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.leadsByStatus.interested} leads
                        </span>
                      </div>
                      <ProgressBar
                        value={metrics.conversionRate.ongoingToInterested}
                        colorScheme="success"
                        size="lg"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Closed</span>
                        <span className="text-sm text-muted-foreground">
                          {metrics.leadsByStatus.closed} leads
                        </span>
                      </div>
                      <ProgressBar
                        value={metrics.conversionRate.interestedToClosed}
                        colorScheme="info"
                        size="lg"
                      />
                    </div>
                  </div>
                </Card>

                {/* Leads by Step */}
                {Object.keys(metrics.leadsByStep).length > 0 && (
                  <Card
                    header={{ title: 'Leads by Current Step' }}
                    padding="lg"
                  >
                    <div className="space-y-4">
                      {Object.entries(metrics.leadsByStep).map(([stepName, count]: [string, any]) => {
                        const percentage = metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0;
                        return (
                          <ProgressBar
                            key={stepName}
                            label={stepName}
                            value={percentage}
                            colorScheme="primary"
                            size="sm"
                          />
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </PageLayout>
      </div>
    </div>
  );
}
