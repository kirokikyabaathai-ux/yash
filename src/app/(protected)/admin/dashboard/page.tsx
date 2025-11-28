/**
 * Admin Dashboard Page
 * 
 * Displays all leads, metrics, system health, and user management interface.
 * Requirements: 17.1, 17.3, 17.4, 17.5
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

export default async function AdminDashboardPage() {
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

  // Verify user is an admin
  if (profile.role !== 'admin') {
    redirect('/login');
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
  const { data: leads, error: leadsError } = await supabase
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
  const { data: users, error: usersError } = await supabase
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

  const { count: totalSteps } = await supabase
    .from('step_master')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
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
              <div className="text-sm font-medium text-muted-foreground">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {totalUsers || 0}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Documents</div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {totalDocuments || 0}
              </div>
            </div>
          </div>
        )}

        {/* Leads by Status */}
        {metrics && (
          <div className="bg-card border border-border rounded-lg shadow-sm mb-8 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Leads by Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ongoing</span>
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
                <span className="text-sm text-muted-foreground">Interested</span>
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
                <span className="text-sm text-muted-foreground">Not Interested</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div
                      className="bg-red-600 dark:bg-red-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${metrics.totalLeads > 0 ? (metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {metrics.leadsByStatus.not_interested}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Closed</span>
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

        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>
            <Link
              href="/admin/leads"
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
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {lead.created_by_user?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">User Management</h2>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Manage users
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users && users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-muted text-foreground">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No users found
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
            href="/admin/steps"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Manage Steps
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure timeline steps and workflow
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-muted-foreground">
              Create and manage user accounts
            </p>
          </Link>

          <Link
            href="/admin/activity-log"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Activity Log
            </h3>
            <p className="text-sm text-muted-foreground">
              View system activity and audit trail
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
