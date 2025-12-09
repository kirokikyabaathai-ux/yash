/**
 * Admin Dashboard Page
 * 
 * Displays all leads, metrics, system health, and user management interface.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 17.1, 17.3, 17.4, 17.5
 * Validates: Requirements 6.1, 6.2, 6.3, 9.1, 9.2, 9.3
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Card, CardGrid } from '@/components/ui/organisms/Card';
import { Users, TrendingUp, Activity, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { DashboardTables } from './DashboardTables';
import { ProgressBar } from '@/components/ui/molecules';

export default async function AdminDashboardPage() {
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

  // Verify user is an admin
  if (profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch dashboard metrics
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

  // Get all leads for admin view
  const { data: leads } = await supabase
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
    .limit(10);

  // Get all users for user management
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get system health metrics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalDocuments } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="Admin Dashboard"
          description={`Welcome back, ${profile.name}`}
        >
          {/* Metrics Grid - Using responsive grid */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <DashboardCard
                title="Total Leads"
                value={metrics.totalLeads}
                icon={<Activity className="h-4 w-4" />}
              />

              <DashboardCard
                title="Ongoing"
                value={metrics.leadsByStatus.ongoing}
                icon={<TrendingUp className="h-4 w-4" />}
              />

              <DashboardCard
                title="Interested"
                value={metrics.leadsByStatus.interested}
                icon={<Users className="h-4 w-4" />}
              />

              <DashboardCard
                title="Closed"
                value={metrics.leadsByStatus.closed}
                icon={<CheckCircle className="h-4 w-4" />}
              />

              <DashboardCard
                title="Conversion Rate"
                value={`${metrics.conversionRate.overallConversion.toFixed(1)}%`}
              />

              <DashboardCard
                title="Pending Actions"
                value={metrics.pendingActions}
                icon={<AlertCircle className="h-4 w-4" />}
              />

              <DashboardCard
                title="Total Users"
                value={totalUsers || 0}
                icon={<Users className="h-4 w-4" />}
              />

              <DashboardCard
                title="Total Documents"
                value={totalDocuments || 0}
                icon={<FileText className="h-4 w-4" />}
              />
            </div>
          )}

          {/* Leads by Status - Using ProgressBar component */}
          {metrics && (
            <Card
              header={{
                title: 'Leads by Status',
              }}
              className="mb-8"
            >
              <div className="space-y-4">
                <ProgressBar
                  label="Ongoing"
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
                  label="Interested"
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
                  label="Not Interested"
                  value={metrics.totalLeads > 0 ? (metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100 : 0}
                  showPercentage={false}
                  colorScheme="error"
                />
                <div className="flex justify-end">
                  <span className="text-sm font-medium">
                    {metrics.leadsByStatus.not_interested}
                  </span>
                </div>

                <ProgressBar
                  label="Closed"
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

          {/* Data Tables */}
          <DashboardTables leads={leads || []} users={users || []} />

          {/* Quick Actions - Using CardGrid */}
          <CardGrid columns={{ sm: 1, md: 3 }} gap="md">
            <Card
              header={{
                title: 'Manage Steps',
              }}
            >
              <Link href="/admin/steps" className="block">
                <p className="text-sm text-muted-foreground">
                  Configure timeline steps and workflow
                </p>
              </Link>
            </Card>

            <Card
              header={{
                title: 'Manage Users',
              }}
            >
              <Link href="/admin/users" className="block">
                <p className="text-sm text-muted-foreground">
                  Create and manage user accounts
                </p>
              </Link>
            </Card>

            <Card
              header={{
                title: 'Activity Log',
              }}
            >
              <Link href="/admin/activity-log" className="block">
                <p className="text-sm text-muted-foreground">
                  View system activity and audit trail
                </p>
              </Link>
            </Card>
          </CardGrid>
        </PageLayout>
      </div>
    </div>
  );
}
