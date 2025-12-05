/**
 * Installer Dashboard Page
 * 
 * Displays assigned installation leads and installation tasks.
 * Requirements: 10.2
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { auth } from '@/lib/auth/auth';

export default async function InstallerDashboardPage() {
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

  // Verify user is an installer
  if (profile.role !== 'installer') {
    redirect('/');
  }

  // Get assigned leads (RLS will filter to installer's assigned leads)
  const { data: assignedLeads, error: leadsError } = await supabase
    .from('leads')
    .select(`
      *,
      created_by_user:created_by (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  // Get installation steps for assigned leads
  const leadIds = assignedLeads?.map(l => l.id) || [];
  
  let installationSteps: any[] = [];
  if (leadIds.length > 0) {
    const { data: steps } = await supabase
      .from('lead_steps')
      .select(`
        *,
        step_master:step_id (
          id,
          step_name,
          order_index
        ),
        lead:lead_id (
          id,
          customer_name,
          phone,
          address
        )
      `)
      .in('lead_id', leadIds)
      .contains('step_master.allowed_roles', ['installer'])
      .order('status', { ascending: true });

    installationSteps = steps || [];
  }

  // Separate pending and completed tasks
  const pendingTasks = installationSteps.filter(s => s.status === 'pending');
  const completedTasks = installationSteps.filter(s => s.status === 'completed');

  // Calculate metrics
  const totalAssignedLeads = assignedLeads?.length || 0;
  const totalPendingTasks = pendingTasks.length;
  const totalCompletedTasks = completedTasks.length;
  const completionRate = (totalPendingTasks + totalCompletedTasks) > 0
    ? (totalCompletedTasks / (totalPendingTasks + totalCompletedTasks)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Installer Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground">Assigned Leads</div>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {totalAssignedLeads}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground">Pending Tasks</div>
            <div className="mt-2 text-3xl font-bold text-accent-foreground">
              {totalPendingTasks}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground">Completed Tasks</div>
            <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {totalCompletedTasks}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
            <div className="mt-2 text-3xl font-bold text-primary">
              {completionRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Pending Installation Tasks */}
        <div className="bg-card border border-border rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Pending Installation Tasks
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {task.step_master?.step_name || 'Unknown Task'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {task.lead?.customer_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {task.lead?.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {task.lead?.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent text-accent-foreground">
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/installer/leads/${task.lead_id}`}
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
                      No pending tasks
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Leads */}
        <div className="bg-card border border-border rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Assigned Leads
            </h2>
            <Link
              href="/installer/leads"
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
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {assignedLeads && assignedLeads.length > 0 ? (
                  assignedLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {lead.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {lead.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/installer/leads/${lead.id}`}
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
                      No assigned leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Completed Tasks */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Recently Completed Tasks
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Completed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {completedTasks.length > 0 ? (
                  completedTasks.slice(0, 10).map((task: any) => (
                    <tr key={task.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {task.step_master?.step_name || 'Unknown Task'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {task.lead?.customer_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {task.completed_at
                            ? new Date(task.completed_at).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      No completed tasks
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/installer/leads"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              View All Assignments
            </h3>
            <p className="text-sm text-muted-foreground">
              See all your assigned installation projects
            </p>
          </Link>

          <Link
            href="/installer/tasks"
            className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              My Tasks
            </h3>
            <p className="text-sm text-muted-foreground">
              View and manage all installation tasks
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
