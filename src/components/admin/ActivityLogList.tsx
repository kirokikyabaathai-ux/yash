/**
 * Activity Log List Component
 * 
 * Displays activity logs with filtering by lead, user, action type, and date range.
 * Requirements: 2.1, 2.6, 12.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Lead Filter */}
            <div className="space-y-2">
              <Label htmlFor="lead-filter">Lead</Label>
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
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label htmlFor="user-filter">User</Label>
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
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="action-filter">Action Type</Label>
              <Input
                id="action-filter"
                type="text"
                value={filters.actionType || ''}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                placeholder="e.g., lead, document, step"
              />
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

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
        </CardContent>
      </Card>

      {/* Activity Log List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({logs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-muted-foreground">Loading activity logs...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No activity logs found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filter criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Entity</TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Lead</TableHead>
                  <TableHead className="font-semibold">Timestamp</TableHead>
                  <TableHead className="font-semibold">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getActionBadgeColor(log.action)}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.entity_type}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="text-sm">
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {log.user.email} • {log.user.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.lead ? (
                        <div className="text-sm">
                          <div className="font-medium">{log.lead.customer_name}</div>
                          <div className="text-muted-foreground text-xs">
                            {log.lead.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.timestamp
                        ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {log.entity_id && (
                          <div className="text-xs">
                            <code className="bg-muted px-1 rounded">
                              {log.entity_id}
                            </code>
                          </div>
                        )}
                        {(log.old_value || log.new_value) && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Changes
                            </summary>
                            <div className="mt-2 space-y-2">
                              {log.old_value && (
                                <div>
                                  <div className="font-medium mb-1">Old Value:</div>
                                  <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.old_value, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_value && (
                                <div>
                                  <div className="font-medium mb-1">New Value:</div>
                                  <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.new_value, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
