/**
 * Activity Log List Component
 * 
 * Displays activity logs with filtering by lead, user, action type, and date range.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 2.1, 2.6, 12.5, 6.1, 6.2, 6.3, 6.4
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { format } from 'date-fns';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Badge } from '@/components/ui/atoms';
import { Input } from '@/components/ui/atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/organisms/Card';
import { FormField } from '@/components/ui/molecules/FormField';
import { Body, Small, H3 } from '@/components/ui/atoms';

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

  // Fetch activity logs with filters
  const fetchLogs = useCallback(async () => {
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
  }, [filters, supabase]);

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
  }, [supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActionBadgeColor = (action: string): 'green' | 'blue' | 'red' | 'gray' => {
    if (action.includes('create')) return 'green';
    if (action.includes('update') || action.includes('modify')) return 'blue';
    if (action.includes('delete')) return 'red';
    if (action.includes('complete')) return 'blue';
    return 'gray';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <Card
        header={{
          title: 'Filters',
        }}
        padding="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Lead Filter */}
            <FormField label="Lead" htmlFor="lead-filter">
              <Select
                value={filters.leadId || 'all'}
                onValueChange={(value) => handleFilterChange('leadId', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="lead-filter" className="w-full">
                  <SelectValue placeholder="All Leads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.customer_name} ({lead.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* User Filter */}
            <FormField label="User" htmlFor="user-filter">
              <Select
                value={filters.userId || 'all'}
                onValueChange={(value) => handleFilterChange('userId', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="user-filter" className="w-full">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Action Type Filter */}
            <FormField label="Action Type" htmlFor="action-filter">
              <Input
                id="action-filter"
                type="text"
                value={filters.actionType || ''}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                placeholder="e.g., lead, document, step"
              />
            </FormField>

            {/* Date From Filter */}
            <FormField label="Date From" htmlFor="date-from">
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </FormField>

            {/* Date To Filter */}
            <FormField label="Date To" htmlFor="date-to">
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </FormField>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

      {/* Activity Log List */}
      <Card
        header={{
          title: `Activity Log (${logs.length} entries)`,
        }}
        padding="lg"
      >
          <DataTable
            data={logs}
            keyExtractor={(log) => log.id}
            loading={loading}
            emptyState={
              <div className="text-center py-8">
                <Body color="secondary">
                  No activity logs found. Try adjusting your filter criteria.
                </Body>
              </div>
            }
            columns={[
              {
                key: 'action',
                header: 'Action',
                render: (value, log) => (
                  <Badge
                    variant="solid"
                    colorScheme={getActionBadgeColor(log.action)}
                    size="sm"
                  >
                    {log.action}
                  </Badge>
                ),
              },
              {
                key: 'entity_type',
                header: 'Entity',
                render: (value) => (
                  <Small color="secondary">{value}</Small>
                ),
              },
              {
                key: 'user_id',
                header: 'User',
                render: (value, log) => (
                  log.user ? (
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">
                        {log.user.name}
                      </div>
                      <Small color="secondary">
                        {log.user.email} • {log.user.role}
                      </Small>
                    </div>
                  ) : (
                    <Small color="secondary">—</Small>
                  )
                ),
              },
              {
                key: 'lead_id',
                header: 'Lead',
                render: (value, log) => (
                  log.lead ? (
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">
                        {log.lead.customer_name}
                      </div>
                      <Small color="secondary">
                        {log.lead.phone}
                      </Small>
                    </div>
                  ) : (
                    <Small color="secondary">—</Small>
                  )
                ),
              },
              {
                key: 'timestamp',
                header: 'Timestamp',
                render: (value, log) => (
                  <Small color="secondary">
                    {log.timestamp
                      ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')
                      : 'N/A'}
                  </Small>
                ),
              },
              {
                key: 'entity_id',
                header: 'Details',
                render: (value, log) => (
                  <div className="flex flex-col gap-2">
                    {log.entity_id && (
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {log.entity_id}
                      </code>
                    )}
                    {(log.old_value || log.new_value) && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Changes
                        </summary>
                        <div className="mt-2 space-y-2">
                          {log.old_value && (
                            <div>
                              <div className="font-bold mb-1">Old Value:</div>
                              <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.old_value, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_value && (
                            <div>
                              <div className="font-bold mb-1">New Value:</div>
                              <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.new_value, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                ),
              },
            ]}
          />
      </Card>
    </div>
  );
}
