/**
 * Search and Filter Integration Tests
 * 
 * Tests the search and filter functionality for leads.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Search and Filter Functionality', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let testUserId: string;
  let testLeadIds: string[] = [];
  let testStepId: string;

  beforeAll(async () => {
    supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Create a test user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: `test-search-${Date.now()}@example.com`,
        name: 'Test Search User',
        phone: `+1555${Date.now().toString().slice(-7)}`,
        role: 'agent',
        status: 'active',
      })
      .select()
      .single();

    if (userError) throw userError;
    testUserId = userData.id;

    // Create test leads with different attributes
    const testLeads = [
      {
        customer_name: 'John Doe',
        phone: '+15551234567',
        email: 'john@example.com',
        address: '123 Main St, New York, NY',
        status: 'ongoing' as const,
        created_by: testUserId,
        source: 'agent' as const,
        kw_requirement: 5.5,
      },
      {
        customer_name: 'Jane Smith',
        phone: '+15559876543',
        email: 'jane@example.com',
        address: '456 Oak Ave, Los Angeles, CA',
        status: 'interested' as const,
        created_by: testUserId,
        source: 'agent' as const,
        kw_requirement: 7.0,
      },
      {
        customer_name: 'Bob Johnson',
        phone: '+15555555555',
        email: 'bob@example.com',
        address: '789 Pine Rd, Chicago, IL',
        status: 'ongoing' as const,
        created_by: testUserId,
        source: 'agent' as const,
        kw_requirement: 10.0,
      },
    ];

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .insert(testLeads)
      .select();

    if (leadsError) throw leadsError;
    testLeadIds = leadsData.map((l) => l.id);

    // Create a test step
    const { data: stepData, error: stepError } = await supabase
      .from('step_master')
      .insert({
        step_name: 'Test Search Step',
        order_index: 9999,
        allowed_roles: ['agent', 'office', 'admin'],
        remarks_required: false,
        attachments_allowed: false,
        customer_upload: false,
      })
      .select()
      .single();

    if (stepError) throw stepError;
    testStepId = stepData.id;

    // Create lead_steps for the first lead
    await supabase.from('lead_steps').insert({
      lead_id: testLeadIds[0],
      step_id: testStepId,
      status: 'pending',
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testLeadIds.length > 0) {
      await supabase.from('leads').delete().in('id', testLeadIds);
    }
    if (testStepId) {
      await supabase.from('step_master').delete().eq('id', testStepId);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  it('should search across multiple fields (name)', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .or('customer_name.ilike.%John%,phone.ilike.%John%,email.ilike.%John%,address.ilike.%John%')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBeGreaterThan(0);
    expect(leads!.some((l) => l.customer_name.includes('John'))).toBe(true);
  });

  it('should search across multiple fields (phone)', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .or('customer_name.ilike.%555123%,phone.ilike.%555123%,email.ilike.%555123%,address.ilike.%555123%')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBeGreaterThan(0);
    expect(leads!.some((l) => l.phone.includes('555123'))).toBe(true);
  });

  it('should search across multiple fields (address)', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .or('customer_name.ilike.%Chicago%,phone.ilike.%Chicago%,email.ilike.%Chicago%,address.ilike.%Chicago%')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBeGreaterThan(0);
    expect(leads!.some((l) => l.address.includes('Chicago'))).toBe(true);
  });

  it('should filter by status', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'ongoing')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBe(2);
    expect(leads!.every((l) => l.status === 'ongoing')).toBe(true);
  });

  it('should filter by multiple statuses', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('status', ['ongoing', 'interested'])
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBe(3);
  });

  it('should filter by date range', async () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', yesterday)
      .lte('created_at', today)
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBe(3);
  });

  it('should filter by timeline step', async () => {
    const { data: leadSteps } = await supabase
      .from('lead_steps')
      .select('lead_id')
      .eq('step_id', testStepId)
      .eq('status', 'pending');

    expect(leadSteps).toBeDefined();
    expect(leadSteps!.length).toBe(1);
    expect(leadSteps![0].lead_id).toBe(testLeadIds[0]);
  });

  it('should combine multiple filters with AND logic', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'ongoing')
      .or('customer_name.ilike.%John%,phone.ilike.%John%,email.ilike.%John%,address.ilike.%John%')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBe(1);
    expect(leads![0].customer_name).toBe('John Doe');
    expect(leads![0].status).toBe('ongoing');
  });

  it('should return empty results when no matches found', async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .or('customer_name.ilike.%NonExistent%,phone.ilike.%NonExistent%,email.ilike.%NonExistent%,address.ilike.%NonExistent%')
      .in('id', testLeadIds);

    expect(leads).toBeDefined();
    expect(leads!.length).toBe(0);
  });
});
