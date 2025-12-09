/**
 * Office Dashboard Page
 * 
 * Displays all leads with filtering, pending actions, and metrics.
 * Requirements: 17.1, 17.3, 17.4, 17.5
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { DashboardTables } from './DashboardTables';
import { Users, TrendingUp, CheckCircle, Activity, AlertCircle } from 'lucide-react';

export default async function OfficeDashboardPage() {
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

  // Verify user is office team
  if (profile.role !== 'office') {
    redirect('/');
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="Office Dashboard"
          description={`Welcome back, ${profile.name}`}
        >
          {/* Metrics Grid */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Total Leads"
                value={metrics.totalLeads}
                icon={<Users className="h-4 w-4" />}
              />

              <DashboardCard
                title="New Lead"
                value={metrics.leadsByStatus.lead || 0}
                icon={<Activity className="h-4 w-4" />}
              />

              <DashboardCard
                title="Lead Processing"
                value={metrics.leadsByStatus.lead_processing || 0}
                icon={<TrendingUp className="h-4 w-4" />}
              />

              <DashboardCard
                title="Completed"
                value={metrics.leadsByStatus.lead_completed || 0}
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
                title="Inquiry → Application"
                value={`${metrics.conversionRate.ongoingToInterested?.toFixed(1) || 0}%`}
              />

              <DashboardCard
                title="Application → Completed"
                value={`${metrics.conversionRate.interestedToClosed?.toFixed(1) || 0}%`}
              />
            </div>
          )}

          {/* Leads by Current Step */}
          {metrics && Object.keys(metrics.leadsByStep).length > 0 && (
            <Card className="mb-8">
            <CardHeader>
              <CardTitle>Leads by Current Step</CardTitle>
            </CardHeader>
            <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Data Tables */}
          <DashboardTables 
            pendingLeads={pendingLeads || []} 
            leads={leads || []} 
          />

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/office/leads/new">
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle>Create New Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add a new solar installation lead
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/office/leads">
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle>Manage Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage all leads
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/office/reports">
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle>View Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate and view reports
                </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </PageLayout>
      </div>
    </div>
  );
}
