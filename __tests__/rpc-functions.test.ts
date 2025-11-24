/**
 * Property-Based Tests for RPC Functions
 * 
 * Feature: solar-crm
 * Properties tested:
 * - Property 27: Timeline Initialization on Lead Creation
 * - Property 28: Step Modification Permission Enforcement
 * - Property 30: Step Completion Data Update
 * - Property 33: Timeline Progression on Step Completion
 * 
 * Validates: Requirements 6.4, 6.5, 7.2, 7.5
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service client for test setup and cleanup
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

// Arbitraries for generating test data
const roleArbitrary = fc.constantFrom('admin', 'agent', 'office', 'installer', 'customer');
const uuidArbitrary = fc.uuid();

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
  status: fc.constant('ongoing'),
  created_by: uuidArbitrary,
  source: fc.constantFrom('agent', 'office', 'customer', 'self'),
});

const stepMasterArbitrary = fc.record({
  id: uuidArbitrary,
  step_name: fc.string({ minLength: 1, maxLength: 100 }),
  order_index: fc.integer({ min: 1, max: 100 }),
  allowed_roles: fc.array(roleArbitrary, { minLength: 1, maxLength: 3 }),
  remarks_required: fc.boolean(),
  attachments_allowed: fc.boolean(),
  customer_upload: fc.boolean(),
});

describe('RPC Function Property Tests', () => {
  
  /**
   * Property 27: Timeline Initialization on Lead Creation
   * For any newly created lead, lead_steps records should be initialized 
   * for all steps in Step Master with status "pending".
   * 
   * Validates: Requirements 6.4
   */
  describe('Property 27: Timeline Initialization on Lead Creation', () => {
    it('should create lead_steps for all step_master steps with pending status', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          fc.array(stepMasterArbitrary, { minLength: 3, maxLength: 10 }),
          async (leadData, userData, stepMasterData) => {
            // Ensure unique order_index values
            stepMasterData.forEach((step, index) => {
              step.order_index = index + 1;
            });

            try {
              // Setup: Create user and step_master records
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert(stepMasterData);

              // Setup: Create lead
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);

              // Execute: Initialize timeline using RPC function
              const { data: result, error } = await serviceClient.rpc('initialize_lead_timeline', {
                p_lead_id: leadData.id
              });

              // Verify: Check that lead_steps were created
              const { data: leadSteps, error: stepsError } = await serviceClient
                .from('lead_steps')
                .select('*')
                .eq('lead_id', leadData.id);

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().in('id', stepMasterData.map(s => s.id));
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions
              expect(error).toBeNull();
              expect(result).toBeDefined();
              expect(result.success).toBe(true);
              expect(stepsError).toBeNull();
              expect(leadSteps).toBeDefined();
              expect(leadSteps?.length).toBe(stepMasterData.length);
              
              // Verify all steps have pending status
              leadSteps?.forEach(step => {
                expect(step.status).toBe('pending');
                expect(step.lead_id).toBe(leadData.id);
              });
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().in('id', stepMasterData.map(s => s.id));
              await serviceClient.from('users').delete().eq('id', userData.id);
              throw error;
            }
          }
        ),
        { numRuns: 10 } // Reduced runs for integration tests
      );
    });
  });

  /**
   * Property 28: Step Modification Permission Enforcement
   * For any user attempting to modify a step, the operation should only succeed 
   * if the user's role is in the step's allowed_roles array or the user is Admin.
   * 
   * Validates: Requirements 6.5
   */
  describe('Property 28: Step Modification Permission Enforcement', () => {
    it('should allow step completion when user role is in allowed_roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          stepMasterArbitrary,
          async (leadData, userData, stepData) => {
            // Ensure user role is in allowed_roles
            stepData.allowed_roles = [userData.role];
            stepData.order_index = 1;

            try {
              // Setup: Create user, step_master, lead, and lead_step
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert(stepData);
              
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);
              
              await serviceClient.from('lead_steps').insert({
                lead_id: leadData.id,
                step_id: stepData.id,
                status: 'pending'
              });

              // Execute: Complete step using RPC function
              const { data: result, error } = await serviceClient.rpc('complete_step', {
                p_lead_id: leadData.id,
                p_step_id: stepData.id,
                p_user_id: userData.id,
                p_remarks: 'Test remarks',
                p_attachments: null
              });

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions
              expect(error).toBeNull();
              expect(result).toBeDefined();
              expect(result.success).toBe(true);
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);
              throw error;
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should prevent step completion when user role is not in allowed_roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          stepMasterArbitrary,
          fc.constantFrom('agent', 'office', 'installer', 'customer'),
          async (leadData, userData, stepData, disallowedRole) => {
            // Ensure user role is NOT in allowed_roles and user is not admin
            userData.role = disallowedRole;
            stepData.allowed_roles = ['admin']; // Only admin allowed
            stepData.order_index = 1;

            try {
              // Setup: Create user, step_master, lead, and lead_step
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert(stepData);
              
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);
              
              await serviceClient.from('lead_steps').insert({
                lead_id: leadData.id,
                step_id: stepData.id,
                status: 'pending'
              });

              // Execute: Attempt to complete step using RPC function
              const { data: result, error } = await serviceClient.rpc('complete_step', {
                p_lead_id: leadData.id,
                p_step_id: stepData.id,
                p_user_id: userData.id,
                p_remarks: 'Test remarks',
                p_attachments: null
              });

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions: Should fail with permission error
              expect(error).toBeDefined();
              expect(error?.message).toContain('not authorized');
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);
              
              // If it's a permission error, that's expected
              if (error instanceof Error && error.message.includes('not authorized')) {
                return; // Test passed
              }
              throw error;
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should allow admin to complete any step regardless of allowed_roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          stepMasterArbitrary,
          async (leadData, userData, stepData) => {
            // Set user as admin
            userData.role = 'admin';
            // Set allowed_roles to exclude admin (to test bypass)
            stepData.allowed_roles = ['office'];
            stepData.order_index = 1;

            try {
              // Setup: Create user, step_master, lead, and lead_step
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert(stepData);
              
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);
              
              await serviceClient.from('lead_steps').insert({
                lead_id: leadData.id,
                step_id: stepData.id,
                status: 'pending'
              });

              // Execute: Complete step as admin
              const { data: result, error } = await serviceClient.rpc('complete_step', {
                p_lead_id: leadData.id,
                p_step_id: stepData.id,
                p_user_id: userData.id,
                p_remarks: 'Admin override',
                p_attachments: null
              });

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions: Admin should succeed
              expect(error).toBeNull();
              expect(result).toBeDefined();
              expect(result.success).toBe(true);
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);
              throw error;
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 30: Step Completion Data Update
   * For any completed step, the lead_steps record should be updated with 
   * status "completed", completed_by user ID, completed_at timestamp, and optional remarks.
   * 
   * Validates: Requirements 7.2
   */
  describe('Property 30: Step Completion Data Update', () => {
    it('should update lead_steps with completion data', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          stepMasterArbitrary,
          fc.string({ minLength: 1, maxLength: 500 }),
          async (leadData, userData, stepData, remarks) => {
            // Ensure user can complete the step
            stepData.allowed_roles = [userData.role];
            stepData.order_index = 1;

            try {
              // Setup: Create user, step_master, lead, and lead_step
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert(stepData);
              
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);
              
              await serviceClient.from('lead_steps').insert({
                lead_id: leadData.id,
                step_id: stepData.id,
                status: 'pending'
              });

              // Execute: Complete step
              const beforeTime = new Date();
              const { data: result, error } = await serviceClient.rpc('complete_step', {
                p_lead_id: leadData.id,
                p_step_id: stepData.id,
                p_user_id: userData.id,
                p_remarks: remarks,
                p_attachments: null
              });
              const afterTime = new Date();

              // Verify: Check lead_steps record
              const { data: leadStep, error: stepError } = await serviceClient
                .from('lead_steps')
                .select('*')
                .eq('lead_id', leadData.id)
                .eq('step_id', stepData.id)
                .single();

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions
              expect(error).toBeNull();
              expect(result).toBeDefined();
              expect(stepError).toBeNull();
              expect(leadStep).toBeDefined();
              expect(leadStep?.status).toBe('completed');
              expect(leadStep?.completed_by).toBe(userData.id);
              expect(leadStep?.remarks).toBe(remarks);
              expect(leadStep?.completed_at).toBeDefined();
              
              // Verify completed_at is within reasonable time range
              const completedAt = new Date(leadStep!.completed_at);
              expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
              expect(completedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().eq('id', stepData.id);
              await serviceClient.from('users').delete().eq('id', userData.id);
              throw error;
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 33: Timeline Progression on Step Completion
   * For any completed step, if a next step exists with status "upcoming", 
   * its status should be updated to "pending".
   * 
   * Validates: Requirements 7.5
   */
  describe('Property 33: Timeline Progression on Step Completion', () => {
    it('should update next step status from upcoming to pending', async () => {
      await fc.assert(
        fc.asyncProperty(
          leadArbitrary,
          userArbitrary,
          stepMasterArbitrary,
          stepMasterArbitrary,
          async (leadData, userData, step1Data, step2Data) => {
            // Setup: Create two sequential steps
            step1Data.order_index = 1;
            step1Data.allowed_roles = [userData.role];
            step2Data.order_index = 2;
            step2Data.allowed_roles = [userData.role];

            try {
              // Setup: Create user, step_master records, lead, and lead_steps
              await serviceClient.from('users').insert(userData);
              await serviceClient.from('step_master').insert([step1Data, step2Data]);
              
              leadData.created_by = userData.id;
              await serviceClient.from('leads').insert(leadData);
              
              await serviceClient.from('lead_steps').insert([
                {
                  lead_id: leadData.id,
                  step_id: step1Data.id,
                  status: 'pending'
                },
                {
                  lead_id: leadData.id,
                  step_id: step2Data.id,
                  status: 'upcoming'
                }
              ]);

              // Execute: Complete first step
              const { data: result, error } = await serviceClient.rpc('complete_step', {
                p_lead_id: leadData.id,
                p_step_id: step1Data.id,
                p_user_id: userData.id,
                p_remarks: 'Completing step 1',
                p_attachments: null
              });

              // Verify: Check second step status
              const { data: step2, error: step2Error } = await serviceClient
                .from('lead_steps')
                .select('*')
                .eq('lead_id', leadData.id)
                .eq('step_id', step2Data.id)
                .single();

              // Cleanup
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().in('id', [step1Data.id, step2Data.id]);
              await serviceClient.from('users').delete().eq('id', userData.id);

              // Assertions
              expect(error).toBeNull();
              expect(result).toBeDefined();
              expect(result.success).toBe(true);
              expect(step2Error).toBeNull();
              expect(step2).toBeDefined();
              expect(step2?.status).toBe('pending');
            } catch (error) {
              // Cleanup on error
              await serviceClient.from('lead_steps').delete().eq('lead_id', leadData.id);
              await serviceClient.from('leads').delete().eq('id', leadData.id);
              await serviceClient.from('step_master').delete().in('id', [step1Data.id, step2Data.id]);
              await serviceClient.from('users').delete().eq('id', userData.id);
              throw error;
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});

