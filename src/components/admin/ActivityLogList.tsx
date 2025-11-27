/**
 * Activity Log List Component
 * 
 * Displays activity logs with filtering by lead, user, action type, and date range.
 * Requirements: 12.5
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { format } from 'date-fns';

type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];

interface ActivityLogWithDetails extends ActivityLog {
  user?: Pick<User, 'name' | 'email' | 'role'>;
  lead?: Pick<Lead, 'customer_name' | 'phone'>;
}

interface FilterState {
  leadId?: string;
  userId?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function ActivityLogList() {
  const [logs, setLogs] = useState<ActivityLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [users, setUsers] = useState<Pick<User, 'id' | 'name' | 'email' | 'role'>[]>([]);
  const [leads, setLeads] = useState<Pick<Lead, 'id' | 'customer_name' | 'phone'>[]>([]);

  const supabase = createClient();

  // Fetch users and leads for filter dropdowns
  useEffect(() => {
    async function fetchFilterData() {
      const [usersRes, leadsRes] = await Promise.all([
        supabase.from('users').select('id, name, email, role').order('name'),
        supabase.from('leads').select('id, customer_name, phone').order('customer_name'),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
    }

    fetchFilterData();
  }, []);

  // Fetch activity logs with filters
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      let query = supabase
        .from('activity_log')
        .select(`
          *,
          user:users!activity_log_user_id_fkey(name, email, role),
          lead:leads!activity_log_lead_id_fkey(customer_name, phone)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.leadId) {
        query = query.eq('lead_id', filters.leadId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.actionType) {
        query = query.ilike('action', `%${filters.actionType}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
      } else {
        setLogs(data as ActivityLogWithDetails[]);
      }

      setLoading(false);
    }

    fetchLogs();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update') || action.includes('modify')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('complete')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Lead Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead
            </label>
            <select
              value={filters.leadId || ''}
              onChange={(e) => handleFilterChange('leadId', e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Leads</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone})
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <input
              type="text"
              value={filters.actionType || ''}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              placeholder="e.g., lead, document, step"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log List */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Activity Log ({logs.length} entries)
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No activity logs found
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-600">
                      {log.entity_type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  {log.user && (
                    <div className="text-gray-700">
                      <span className="font-medium">User:</span> {log.user.name} (
                      {log.user.email}) - {log.user.role}
                    </div>
                  )}

                  {log.lead && (
                    <div className="text-gray-700">
                      <span className="font-medium">Lead:</span>{' '}
                      {log.lead.customer_name} ({log.lead.phone})
                    </div>
                  )}

                  {log.entity_id && (
                    <div className="text-gray-700">
                      <span className="font-medium">Entity ID:</span>{' '}
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        {log.entity_id}
                      </code>
                    </div>
                  )}

                  {log.old_value && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Old Value
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.old_value, null, 2)}
                      </pre>
                    </details>
                  )}

                  {log.new_value && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        New Value
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.new_value, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
