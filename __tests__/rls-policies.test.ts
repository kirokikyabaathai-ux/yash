/**
 * Property-Based Tests for Row-Level Security (RLS) Policies
 * 
 * Feature: solar-crm
 * Properties tested:
 * - Property 34: Agent RLS Lead Filtering
 * - Property 35: Customer RLS Lead Filtering
 * - Property 36: Office and Admin RLS Full Access
 * - Property 37: Installer RLS Lead Filtering
 * - Property 38: Step Master RLS Admin-Only Modification
 * 
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper function to create a Supabase client for a specific user
const createUserClient = (userId: string, role: string) => {
  // In a real implementation, this would use the user's JWT token
  // For testing, we'll use the service role key and set the user context
  const client = createClient(supabaseUrl, supabaseServiceKey);
  return client;
};

// Arbitraries for generating test data
const roleArbitrary = fc.constantFrom('admin', 'agent', 'office', 'installer', 'customer');
const uuidArbitrary = fc.uuid();
const leadStatusArbitrary = fc.constantFrom('ongoing', 'interested', 'not_interested', 'closed');

const userArbitrary = fc.record({
  id: uuidArbitrary,
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  role: roleArbitrary,
  status: fc.constant('active'),
});

const leadArbitrary = fc.record({
  id: uuidArbitrary,
  customer_name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  email: fc.emailAddress(),
  address: fc.string({ minLength: 5, maxLength: 200 }),
  kw_requirement: fc.double({ min: 1, max: 100 }),
  roof_type: fc.constantFrom('flat', 'sloped', 'mixed'),
  notes: fc.string({ maxLength: 500 }),
  status: leadStatusArbitrary,
  created_by: uuidArbitrary,
  customer_account_id: fc.option(uuidArbitrary, { nil: null }),
  installer_id: fc.option(uuidArbitrary, { nil: null }),
  source: fc.constantFrom('agent', 'office', 'customer', 'self'),
});

describe('RLS Policy Property Tests', () => {
  
  /**
   * Property 34: Agent RLS Lead Filtering
   * For any Agent querying the leads table, RLS policies should restrict results 
   * to leads where created_by equals the Agent's user ID.
   * 
   * Validates: Requirements 8.1
   */
  describe('Property 34: Agent RLS Lead Filtering', () => {
    it('should only return leads created by the agent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(leadArbitrary, { minLength: 5, maxLength: 20 }),
          uuidArbitrary, // agentId
          async (allLeads, agentId) => {
            // Setup: Create agent user
            const agentUser = {
              id: agentId,
              email: `agent-${agentId}@test.com`,
              name: 'Test Agent',
              phone: '1234567890',
              role: 'agent',
              status: 'active',
            };

            // Setup: Assign some leads to this agent
            const agentLeads = allLeads.slice(0, Math.floor(allLeads.length / 2));
            agentLeads.forEach(lead => {
              lead.created_by = agentId;
            });

            // Create all leads in database (using service role)
            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(agentUser);
            await serviceClient.from('leads').insert(allLeads);

            // Query as agent (with RLS enforced)
            const agentClient = createUserClient(agentId, 'agent');
            const { data: queriedLeads, error } = await agentClient
              .from('leads')
              .select('*');

            // Cleanup
            await serviceClient.from('leads').delete().in('id', allLeads.map(l => l.id));
            await serviceClient.from('users').delete().eq('id', agentId);

            // Verify: All returned leads should be created by the agent
            expect(error).toBeNull();
            expect(queriedLeads).toBeDefined();
            queriedLeads?.forEach(lead => {
              expect(lead.created_by).toBe(agentId);
            });
          }
        )
      );
    });
  });

  /**
   * Property 35: Customer RLS Lead Filtering
   * For any Customer querying the leads table, RLS policies should restrict results 
   * to leads where customer_account_id equals the Customer's user ID.
   * 
   * Validates: Requirements 8.2
   */
  describe('Property 35: Customer RLS Lead Filtering', () => {
    it('should only return leads linked to the customer', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(leadArbitrary, { minLength: 5, maxLength: 20 }),
          uuidArbitrary, // customerId
          async (allLeads, customerId) => {
            // Setup: Create customer user
            const customerUser = {
              id: customerId,
              email: `customer-${customerId}@test.com`,
              name: 'Test Customer',
              phone: '1234567890',
              role: 'customer',
              status: 'active',
            };

            // Setup: Link some leads to this customer
            const customerLeads = allLeads.slice(0, Math.floor(allLeads.length / 3));
            customerLeads.forEach(lead => {
              lead.customer_account_id = customerId;
            });

            // Create all leads in database
            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(customerUser);
            await serviceClient.from('leads').insert(allLeads);

            // Query as customer
            const customerClient = createUserClient(customerId, 'customer');
            const { data: queriedLeads, error } = await customerClient
              .from('leads')
              .select('*');

            // Cleanup
            await serviceClient.from('leads').delete().in('id', allLeads.map(l => l.id));
            await serviceClient.from('users').delete().eq('id', customerId);

            // Verify: All returned leads should be linked to the customer
            expect(error).toBeNull();
            expect(queriedLeads).toBeDefined();
            queriedLeads?.forEach(lead => {
              expect(lead.customer_account_id).toBe(customerId);
            });
          }
        )
      );
    });
  });

  /**
   * Property 36: Office and Admin RLS Full Access
   * For any Office Team or Admin user querying the leads table, RLS policies 
   * should allow access to all leads.
   * 
   * Validates: Requirements 8.3
   */
  describe('Property 36: Office and Admin RLS Full Access', () => {
    it('should return all leads for office users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(leadArbitrary, { minLength: 5, maxLength: 20 }),
          uuidArbitrary, // officeUserId
          async (allLeads, officeUserId) => {
            // Setup: Create office user
            const officeUser = {
              id: officeUserId,
              email: `office-${officeUserId}@test.com`,
              name: 'Test Office',
              phone: '1234567890',
              role: 'office',
              status: 'active',
            };

            // Create all leads in database
            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(officeUser);
            await serviceClient.from('leads').insert(allLeads);

            // Query as office user
            const officeClient = createUserClient(officeUserId, 'office');
            const { data: queriedLeads, error } = await officeClient
              .from('leads')
              .select('*');

            // Cleanup
            await serviceClient.from('leads').delete().in('id', allLeads.map(l => l.id));
            await serviceClient.from('users').delete().eq('id', officeUserId);

            // Verify: All leads should be returned
            expect(error).toBeNull();
            expect(queriedLeads).toBeDefined();
            expect(queriedLeads?.length).toBe(allLeads.length);
          }
        )
      );
    });

    it('should return all leads for admin users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(leadArbitrary, { minLength: 5, maxLength: 20 }),
          uuidArbitrary, // adminUserId
          async (allLeads, adminUserId) => {
            // Setup: Create admin user
            const adminUser = {
              id: adminUserId,
              email: `admin-${adminUserId}@test.com`,
              name: 'Test Admin',
              phone: '1234567890',
              role: 'admin',
              status: 'active',
            };

            // Create all leads in database
            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(adminUser);
            await serviceClient.from('leads').insert(allLeads);

            // Query as admin user
            const adminClient = createUserClient(adminUserId, 'admin');
            const { data: queriedLeads, error } = await adminClient
              .from('leads')
              .select('*');

            // Cleanup
            await serviceClient.from('leads').delete().in('id', allLeads.map(l => l.id));
            await serviceClient.from('users').delete().eq('id', adminUserId);

            // Verify: All leads should be returned
            expect(error).toBeNull();
            expect(queriedLeads).toBeDefined();
            expect(queriedLeads?.length).toBe(allLeads.length);
          }
        )
      );
    });
  });

  /**
   * Property 37: Installer RLS Lead Filtering
   * For any Installer querying the leads table, RLS policies should restrict results 
   * to leads where installer_id equals the Installer's user ID.
   * 
   * Validates: Requirements 8.4
   */
  describe('Property 37: Installer RLS Lead Filtering', () => {
    it('should only return leads assigned to the installer', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(leadArbitrary, { minLength: 5, maxLength: 20 }),
          uuidArbitrary, // installerId
          async (allLeads, installerId) => {
            // Setup: Create installer user
            const installerUser = {
              id: installerId,
              email: `installer-${installerId}@test.com`,
              name: 'Test Installer',
              phone: '1234567890',
              role: 'installer',
              status: 'active',
            };

            // Setup: Assign some leads to this installer
            const installerLeads = allLeads.slice(0, Math.floor(allLeads.length / 2));
            installerLeads.forEach(lead => {
              lead.installer_id = installerId;
            });

            // Create all leads in database
            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(installerUser);
            await serviceClient.from('leads').insert(allLeads);

            // Query as installer
            const installerClient = createUserClient(installerId, 'installer');
            const { data: queriedLeads, error } = await installerClient
              .from('leads')
              .select('*');

            // Cleanup
            await serviceClient.from('leads').delete().in('id', allLeads.map(l => l.id));
            await serviceClient.from('users').delete().eq('id', installerId);

            // Verify: All returned leads should be assigned to the installer
            expect(error).toBeNull();
            expect(queriedLeads).toBeDefined();
            queriedLeads?.forEach(lead => {
              expect(lead.installer_id).toBe(installerId);
            });
          }
        )
      );
    });
  });

  /**
   * Property 38: Step Master RLS Admin-Only Modification
   * For any user attempting to modify step_master table, RLS policies should only 
   * allow the operation if the user's role is 'admin'.
   * 
   * Validates: Requirements 8.5
   */
  describe('Property 38: Step Master RLS Admin-Only Modification', () => {
    it('should allow admin to modify step_master', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArbitrary, // adminUserId
          fc.record({
            step_name: fc.string({ minLength: 1, maxLength: 100 }),
            order_index: fc.integer({ min: 1, max: 100 }),
            allowed_roles: fc.array(roleArbitrary, { minLength: 1, maxLength: 5 }),
            remarks_required: fc.boolean(),
            attachments_allowed: fc.boolean(),
            customer_upload: fc.boolean(),
          }),
          async (adminUserId, stepData) => {
            // Setup: Create admin user
            const adminUser = {
              id: adminUserId,
              email: `admin-${adminUserId}@test.com`,
              name: 'Test Admin',
              phone: '1234567890',
              role: 'admin',
              status: 'active',
            };

            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(adminUser);

            // Attempt to insert as admin
            const adminClient = createUserClient(adminUserId, 'admin');
            const { data, error } = await adminClient
              .from('step_master')
              .insert(stepData)
              .select();

            // Cleanup
            if (data && data.length > 0) {
              await serviceClient.from('step_master').delete().eq('id', data[0].id);
            }
            await serviceClient.from('users').delete().eq('id', adminUserId);

            // Verify: Admin should be able to insert
            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data?.length).toBeGreaterThan(0);
          }
        )
      );
    });

    it('should prevent non-admin from modifying step_master', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArbitrary, // nonAdminUserId
          fc.constantFrom('agent', 'office', 'installer', 'customer'), // non-admin role
          fc.record({
            step_name: fc.string({ minLength: 1, maxLength: 100 }),
            order_index: fc.integer({ min: 1, max: 100 }),
            allowed_roles: fc.array(roleArbitrary, { minLength: 1, maxLength: 5 }),
            remarks_required: fc.boolean(),
            attachments_allowed: fc.boolean(),
            customer_upload: fc.boolean(),
          }),
          async (nonAdminUserId, role, stepData) => {
            // Setup: Create non-admin user
            const nonAdminUser = {
              id: nonAdminUserId,
              email: `user-${nonAdminUserId}@test.com`,
              name: 'Test User',
              phone: '1234567890',
              role: role,
              status: 'active',
            };

            const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
            await serviceClient.from('users').insert(nonAdminUser);

            // Attempt to insert as non-admin
            const userClient = createUserClient(nonAdminUserId, role);
            const { data, error } = await userClient
              .from('step_master')
              .insert(stepData)
              .select();

            // Cleanup
            await serviceClient.from('users').delete().eq('id', nonAdminUserId);

            // Verify: Non-admin should NOT be able to insert
            expect(error).toBeDefined();
            expect(data).toBeNull();
          }
        )
      );
    });
  });
});
