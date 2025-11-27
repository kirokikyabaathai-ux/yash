/**
 * Property-Based Tests for Search and Filter Functionality
 * 
 * Tests universal properties that should hold across all inputs
 * for search and filter operations on leads.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { LeadStatus } from '@/types/database';

const LEAD_STATUSES: LeadStatus[] = [
  'inquiry',
  'documentation_pending',
  'application_submitted',
  'in_progress',
  'completed',
  'withdrawn',
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Search and Filter Properties', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let testUserId: string;
  const cleanupLeadIds: string[] = [];
  const cleanupStepIds: string[] = [];

  beforeAll(async () => {
    supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Create a test user for lead creation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: `test-props-${Date.now()}@example.com`,
        name: 'Test Props User',
        phone: `+1555${Date.now().toString().slice(-7)}`,
        role: 'agent',
        status: 'active',
      })
      .select()
      .single();

    if (userError) throw userError;
    testUserId = userData.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (cleanupLeadIds.length > 0) {
      await supabase.from('leads').delete().in('id', cleanupLeadIds);
    }
    if (cleanupStepIds.length > 0) {
      await supabase.from('step_master').delete().in('id', cleanupStepIds);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  /**
   * Feature: solar-crm, Property 82: Multi-Field Search
   * 
   * For any search text entered, leads matching the term in name, phone, 
   * email, or address fields should be returned.
   * 
   * Validates: Requirements 18.1
   */
  it('Property 82: Multi-Field Search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customer_name: fc.string({ minLength: 5, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          email: fc.emailAddress(),
          address: fc.string({ minLength: 10, maxLength: 50 }),
          searchField: fc.constantFrom('customer_name', 'phone', 'email', 'address'),
        }),
        async (testData) => {
          // Create a lead with the test data
          const { data: lead, error } = await supabase
            .from('leads')
            .insert({
              customer_name: testData.customer_name,
              phone: testData.phone,
              email: testData.email,
              address: testData.address,
              status: 'inquiry',
              created_by: testUserId,
              source: 'agent',
            })
            .select()
            .single();

          if (error) throw error;
          cleanupLeadIds.push(lead.id);

          // Extract a search term from the selected field
          const searchTerm = testData[testData.searchField].slice(0, 5);

          // Search across all fields
          const { data: results } = await supabase
            .from('leads')
            .select('*')
            .or(`customer_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
            .eq('id', lead.id);

          // Verify the lead is found if the search term exists in any field
          const fieldValue = testData[testData.searchField].toLowerCase();
          if (fieldValue.includes(searchTerm.toLowerCase())) {
            expect(results).toBeDefined();
            expect(results!.length).toBeGreaterThan(0);
            expect(results!.some(r => r.id === lead.id)).toBe(true);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for integration test
    );
  });

  /**
   * Feature: solar-crm, Property 83: Status Filter Application
   * 
   * For any status filter applied, only leads with matching status 
   * values should be displayed.
   * 
   * Validates: Requirements 18.2
   */
  it('Property 83: Status Filter Application', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            customer_name: fc.string({ minLength: 5, maxLength: 20 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
            status: fc.constantFrom<LeadStatus>(...LEAD_STATUSES),
          }),
          { minLength: 3, maxLength: 5 }
        ),
        fc.constantFrom<LeadStatus>(...LEAD_STATUSES),
        async (leadsData, filterStatus) => {
          // Create leads with different statuses
          const createdLeads = [];
          for (const leadData of leadsData) {
            const { data: lead, error } = await supabase
              .from('leads')
              .insert({
                customer_name: leadData.customer_name,
                phone: leadData.phone,
                address: 'Test Address',
                status: leadData.status,
                created_by: testUserId,
                source: 'agent',
              })
              .select()
              .single();

            if (error) throw error;
            cleanupLeadIds.push(lead.id);
            createdLeads.push(lead);
          }

          // Filter by status
          const { data: filteredLeads } = await supabase
            .from('leads')
            .select('*')
            .eq('status', filterStatus)
            .in('id', createdLeads.map(l => l.id));

          // Verify all returned leads have the filtered status
          expect(filteredLeads).toBeDefined();
          filteredLeads!.forEach(lead => {
            expect(lead.status).toBe(filterStatus);
          });

          // Verify count matches expected
          const expectedCount = createdLeads.filter(l => l.status === filterStatus).length;
          expect(filteredLeads!.length).toBe(expectedCount);
        }
      ),
      { numRuns: 5 } // Reduced runs for integration test
    );
  });

  /**
   * Feature: solar-crm, Property 84: Date Range Filter Application
   * 
   * For any date range filter applied, only leads created within 
   * the specified range should be displayed.
   * 
   * Validates: Requirements 18.3
   */
  it('Property 84: Date Range Filter Application', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customer_name: fc.string({ minLength: 5, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
        }),
        async (leadData) => {
          // Create a lead
          const { data: lead, error } = await supabase
            .from('leads')
            .insert({
              customer_name: leadData.customer_name,
              phone: leadData.phone,
              address: 'Test Address',
              status: 'inquiry',
              created_by: testUserId,
              source: 'agent',
            })
            .select()
            .single();

          if (error) throw error;
          cleanupLeadIds.push(lead.id);

          // Define date range that includes the lead
          const leadDate = new Date(lead.created_at);
          const dateFrom = new Date(leadDate.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day before
          const dateTo = new Date(leadDate.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day after

          // Filter by date range
          const { data: filteredLeads } = await supabase
            .from('leads')
            .select('*')
            .gte('created_at', dateFrom)
            .lte('created_at', dateTo)
            .eq('id', lead.id);

          // Verify the lead is included in the date range
          expect(filteredLeads).toBeDefined();
          expect(filteredLeads!.length).toBe(1);
          expect(filteredLeads![0].id).toBe(lead.id);

          // Verify lead is excluded when outside date range
          const dateFromFuture = new Date(leadDate.getTime() + 48 * 60 * 60 * 1000).toISOString();
          const { data: excludedLeads } = await supabase
            .from('leads')
            .select('*')
            .gte('created_at', dateFromFuture)
            .eq('id', lead.id);

          expect(excludedLeads).toBeDefined();
          expect(excludedLeads!.length).toBe(0);
        }
      ),
      { numRuns: 10 } // Reduced runs for integration test
    );
  });

  /**
   * Feature: solar-crm, Property 85: Timeline Step Filter Application
   * 
   * For any timeline step filter applied, only leads currently at 
   * the selected step should be displayed.
   * 
   * Validates: Requirements 18.4
   */
  it('Property 85: Timeline Step Filter Application', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customer_name: fc.string({ minLength: 5, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          step_name: fc.string({ minLength: 5, maxLength: 20 }),
        }),
        async (testData) => {
          // Create a test step
          const { data: step, error: stepError } = await supabase
            .from('step_master')
            .insert({
              step_name: testData.step_name,
              order_index: Math.floor(Math.random() * 10000) + 10000,
              allowed_roles: ['agent', 'office', 'admin'],
              remarks_required: false,
              attachments_allowed: false,
              customer_upload: false,
            })
            .select()
            .single();

          if (stepError) throw stepError;
          cleanupStepIds.push(step.id);

          // Create a lead
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
              customer_name: testData.customer_name,
              phone: testData.phone,
              address: 'Test Address',
              status: 'inquiry',
              created_by: testUserId,
              source: 'agent',
            })
            .select()
            .single();

          if (leadError) throw leadError;
          cleanupLeadIds.push(lead.id);

          // Create a lead_step with pending status
          await supabase.from('lead_steps').insert({
            lead_id: lead.id,
            step_id: step.id,
            status: 'pending',
          });

          // Filter by timeline step
          const { data: leadSteps } = await supabase
            .from('lead_steps')
            .select('lead_id')
            .eq('step_id', step.id)
            .eq('status', 'pending');

          // Verify the lead is found
          expect(leadSteps).toBeDefined();
          expect(leadSteps!.length).toBeGreaterThan(0);
          expect(leadSteps!.some(ls => ls.lead_id === lead.id)).toBe(true);
        }
      ),
      { numRuns: 5 } // Reduced runs for integration test
    );
  });

  /**
   * Feature: solar-crm, Property 86: Combined Filter Logic
   * 
   * For any combination of multiple filters, results should match 
   * all criteria using AND logic and display the correct result count.
   * 
   * Validates: Requirements 18.5
   */
  it('Property 86: Combined Filter Logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            customer_name: fc.string({ minLength: 5, maxLength: 20 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
            status: fc.constantFrom<LeadStatus>('inquiry', 'application_submitted'),
            address: fc.string({ minLength: 10, maxLength: 50 }),
          }),
          { minLength: 3, maxLength: 5 }
        ),
        async (leadsData) => {
          // Create leads
          const createdLeads = [];
          for (const leadData of leadsData) {
            const { data: lead, error } = await supabase
              .from('leads')
              .insert({
                customer_name: leadData.customer_name,
                phone: leadData.phone,
                address: leadData.address,
                status: leadData.status,
                created_by: testUserId,
                source: 'agent',
              })
              .select()
              .single();

            if (error) throw error;
            cleanupLeadIds.push(lead.id);
            createdLeads.push(lead);
          }

          // Apply combined filters: status AND search
          const filterStatus: LeadStatus = 'inquiry';
          const searchTerm = leadsData[0].customer_name.slice(0, 3);

          const { data: filteredLeads } = await supabase
            .from('leads')
            .select('*')
            .eq('status', filterStatus)
            .ilike('customer_name', `%${searchTerm}%`)
            .in('id', createdLeads.map(l => l.id));

          // Verify all results match BOTH filters
          expect(filteredLeads).toBeDefined();
          filteredLeads!.forEach(lead => {
            expect(lead.status).toBe(filterStatus);
            expect(lead.customer_name.toLowerCase()).toContain(searchTerm.toLowerCase());
          });

          // Verify count matches expected (AND logic)
          const expectedLeads = createdLeads.filter(
            l => l.status === filterStatus && 
                 l.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          expect(filteredLeads!.length).toBe(expectedLeads.length);
        }
      ),
      { numRuns: 5 } // Reduced runs for integration test
    );
  });
});
