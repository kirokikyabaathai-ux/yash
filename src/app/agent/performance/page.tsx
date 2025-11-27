/**
 * Agent Performance Page
 * Detailed performance metrics and analytics for the agent
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AgentPerformancePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/login');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/agent/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
          <p className="mt-2 text-sm text-gray-600">
            Detailed analytics and performance metrics
          </p>
        </div>

        {metrics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Leads</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalLeads}
                </div>
                <div className="mt-2 text-xs text-gray-500">All time</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
                <div className="mt-2 text-3xl font-bold text-indigo-600">
                  {metrics.conversionRate.overallConversion.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Ongoing → Closed
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Success Rate</div>
                <div className="mt-2 text-3xl font-bold text-emerald-600">
                  {metrics.conversionRate.interestedToClosed.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Interested → Closed
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Active Leads</div>
                <div className="mt-2 text-3xl font-bold text-blue-600">
                  {metrics.leadsByStatus.ongoing + metrics.leadsByStatus.interested}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Ongoing + Interested
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Lead Status Breakdown
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Ongoing</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.leadsByStatus.ongoing} ({((metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${(metrics.leadsByStatus.ongoing / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Interested</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.leadsByStatus.interested} ({((metrics.leadsByStatus.interested / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${(metrics.leadsByStatus.interested / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Closed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.leadsByStatus.closed} ({((metrics.leadsByStatus.closed / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{
                        width: `${(metrics.leadsByStatus.closed / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Not Interested</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.leadsByStatus.not_interested} ({((metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{
                        width: `${(metrics.leadsByStatus.not_interested / metrics.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Monthly Performance Trends
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Leads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closed Deals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(monthlyData).map(([month, data]) => (
                      <tr key={month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.closed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
