/**
 * Installer Dashboard Page
 * 
 * Displays assigned installation leads and installation tasks.
 * Refactored to use Penpot Design System components.
 * 
 * Requirements: 10.2
 * Validates: Requirements 6.1, 6.2, 6.3, 9.1, 9.2, 9.3
 */



import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { DashboardTables } from './DashboardTables';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Card, CardGrid } from '@/components/ui/organisms/Card';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, TrendingUp, Percent } from 'lucide-react';

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

  // Define columns for pending tasks table
  const pendingTasksColumns = [
    {
      key: 'step_name' as const,
      header: 'Task',
      render: (value: any, row: any) => (
        <div className="text-sm font-medium text-[var(--penpot-neutral-dark)]">
          {row.step_master?.step_name || 'Unknown Task'}
        </div>
      ),
    },
    {
      key: 'customer_name' as const,
      header: 'Customer',
      render: (value: any, row: any) => (
        <div className="text-sm text-[var(--penpot-neutral-dark)]">
          {row.lead?.customer_name || 'N/A'}
        </div>
      ),
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      render: (value: any, row: any) => (
        <div className="text-sm text-[var(--penpot-neutral-secondary)]">
          {row.lead?.phone || 'N/A'}
        </div>
      ),
    },
    {
      key: 'address' as const,
      header: 'Address',
      render: (value: any, row: any) => (
        <div className="text-sm text-[var(--penpot-neutral-secondary)] max-w-xs truncate">
          {row.lead?.address || 'N/A'}
        </div>
      ),
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: any) => (
        <Badge variant="subtle" colorScheme="blue" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions' as const,
      header: 'Actions',
      render: (value: any, row: any) => (
        <Link
          href={`/installer/leads/${row.lead_id}`}
          className="text-sm text-[var(--penpot-primary)] hover:opacity-80 transition-opacity"
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
          title="Installer Dashboard"
          description={`Welcome back, ${profile.name}`}
        >
          {/* Metrics Grid - Using DashboardCard component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <DashboardCard
              title="Assigned Leads"
              value={totalAssignedLeads}
              icon={<Activity className="h-4 w-4" />}
            />

            <DashboardCard
              title="Pending Tasks"
              value={totalPendingTasks}
              icon={<TrendingUp className="h-4 w-4" />}
            />

            <DashboardCard
              title="Completed Tasks"
              value={totalCompletedTasks}
              icon={<CheckCircle className="h-4 w-4" />}
            />

            <DashboardCard
              title="Completion Rate"
              value={`${completionRate.toFixed(1)}%`}
              icon={<Percent className="h-4 w-4" />}
            />
          </div>

          {/* Pending Installation Tasks - Using DataTable component */}
          <Card
            header={{
              title: 'Pending Installation Tasks',
            }}
            className="mb-8"
            padding="none"
          >
            <DataTable
              columns={pendingTasksColumns}
              data={pendingTasks}
              sortable
              keyExtractor={(row) => row.id}
              emptyState={
                <p className="text-sm text-[var(--penpot-neutral-secondary)]">
                  No pending tasks
                </p>
              }
            />
          </Card>

          {/* Data Tables */}
          <DashboardTables 
            assignedLeads={assignedLeads || []} 
            completedTasks={completedTasks || []} 
          />

          {/* Quick Actions - Using CardGrid and Card components */}
          <CardGrid columns={{ sm: 1, md: 2 }} gap="md" className="mt-8">
            <Card
              clickable
              onClick={() => {}}
              header={{
                title: 'View All Assignments',
              }}
            >
              <Link href="/installer/leads" className="block">
                <p className="text-sm text-[var(--penpot-neutral-secondary)]">
                  See all your assigned installation projects
                </p>
              </Link>
            </Card>

            <Card
              clickable
              onClick={() => {}}
              header={{
                title: 'My Tasks',
              }}
            >
              <Link href="/installer/tasks" className="block">
                <p className="text-sm text-[var(--penpot-neutral-secondary)]">
                  View and manage all installation tasks
                </p>
              </Link>
            </Card>
          </CardGrid>
        </PageLayout>
      </div>
    </div>
  );
}
