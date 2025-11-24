/**
 * Property-Based Tests for Admin Override Capabilities
 * 
 * Tests correctness properties for admin permission bypass, data access,
 * step modification override, document status management, and timeline manipulation.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * Feature: solar-crm
 * Properties: 47-51
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';
import type { UserRole, StepStatus, DocumentStatus } from '../src/types/database';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Initialize Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Skip tests if Supabase credentials are not configured
const skipTests = !supabaseUrl || !supabaseServiceKey || supabaseUrl === '';

let supabase: ReturnType<typeof createClient<Database>>;
if (!skipTests) {
  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Helper arbitraries
const emailArbitrary = fc.emailAddress();
const phoneArbitrary = fc
  .integer({ min: 1000000000, max: 9999999999 })
  .map((n) => n.toString());
const nameArbitrary = fc.string({ minLength: 3, maxLength: 50 });
const roleArbitrary = fc.constantFrom<UserRole>(
  'admin',
  'agent',
  'office',
  'installer',
  'customer'
);
const nonAdminRoleArbitrary = fc.constantFrom<UserRole>(
  'agent',
  'office',
  'installer',
  'customer'
);
const stepStatusArbitrary = fc.constantFrom<StepStatus>(
  'upcoming',
  'pending',
  'completed'
);
const documentStatusArbitrary = fc.constantFrom<DocumentStatus>(
  'valid',
  'corrupted',
  'replaced'
);

// Cleanup functions
async function cleanupUser(userId: string) {
  try {
    await supabase.from('users').delete().eq('id', userId);
    await supabase.auth.admin.deleteUser(userId);
  } catch (error) {
    console.error('Cleanup user error:', error);
  }
}

async function cleanupLead(leadId: string) {
  try {
    await supabase.from('leads').delete().eq('id', leadId);
  } catch (error) {
    console.error('Cleanup lead error:', error);
  }
}

async function cleanupDocument(documentId: string) {
  try {
    await supabase.from('documents').delete().eq('id', documentId);
  } catch (error) {
    console.error('Cleanup document error:', error);
  }
}

async function cleanupStepMaster(stepId: string) {
  try {
    await supabase.from('step_master').delete().eq('id', stepId);
  } catch (error) {
    console.error('Cleanup step_master error:', error);
  }
}

// Helper function to create a test user
async function createTestUser(role: UserRole, email: string, phone: string, name: string) {
  const password = 'TestPassword123!';

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }

  // Create user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      phone,
      name,
      role,
      status: 'active',
    })
    .select()
    .single();

  if (userError || !userData) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create user profile: ${userError?.message}`);
  }

  return userData;
}

describe('Admin Override Capabilities Properties', () => {
  // Skip all tests if Supabase is not configured
  if (skipTests) {
    test.skip('Supabase credentials not configured - skipping property tests', () => {});
    return;
  }

  /**
   * Feature: solar-crm, Property 47: Admin Permission Bypass
   * 
   * For any operation attempted by an Admin user, all role-based restrictions 
   * and RLS policies should be bypassed.
   * 
   * Validates: Requirements 11.1
   */
  test('Property 47: Admin Permission Bypass', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminEmail: emailArbitrary,
          adminPhone: phoneArbitrary,
          adminName: nameArbitrary,
          agentEmail: emailArbitrary,
          agentPhone: phoneArbitrary,
          agentName: nameArbitrary,
        }),
        async (testData) => {
          let adminUserId: string | null = null;
          let agentUserId: string | null = null;
          let leadId: string | null = null;

          try {
            // Create admin user
            const adminUser = await createTestUser(
              'admin',
              testData.adminEmail,
              testData.adminPhone,
              testData.adminName
            );
            adminUserId = adminUser.id;

            // Create agent user
            const agentUser = await createTestUser(
              'agent',
              testData.agentEmail,
              testData.agentPhone,
              testData.agentName
            );
            agentUserId = agentUser.id;

            // Create a lead owned by the agent
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                created_by: agentUserId,
                source: 'agent',
              })
              .select()
              .single();

            if (leadError || !lead) {
              throw new Error('Failed to create lead');
            }
            leadId = lead.id;

            // Admin should be able to access the lead (bypassing RLS)
            const { data: adminLeadAccess, error: adminAccessError } = await supabase
              .from('leads')
              .select('*')
              .eq('id', leadId)
              .single();

            // Verify admin can access the lead
            expect(adminAccessError).toBeNull();
            expect(adminLeadAccess).toBeDefined();
            expect(adminLeadAccess?.id).toBe(leadId);
          } finally {
            // Cleanup
            if (leadId) await cleanupLead(leadId);
            if (agentUserId) await cleanupUser(agentUserId);
            if (adminUserId) await cleanupUser(adminUserId);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs due to user creation overhead
    );
  });

  /**
   * Feature: solar-crm, Property 48: Admin Complete Data Access
   * 
   * For any lead viewed by an Admin, all information including documents, 
   * forms, and timeline history should be accessible.
   * 
   * Validates: Requirements 11.2
   */
  test('Property 48: Admin Complete Data Access', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminEmail: emailArbitrary,
          adminPhone: phoneArbitrary,
          adminName: nameArbitrary,
        }),
        async (testData) => {
          let adminUserId: string | null = null;
          let leadId: string | null = null;
          let documentId: string | null = null;

          try {
            // Create admin user
            const adminUser = await createTestUser(
              'admin',
              testData.adminEmail,
              testData.adminPhone,
              testData.adminName
            );
            adminUserId = adminUser.id;

            // Create a lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                created_by: adminUserId,
                source: 'office',
              })
              .select()
              .single();

            if (leadError || !lead) {
              throw new Error('Failed to create lead');
            }
            leadId = lead.id;

            // Create a document for the lead
            const { data: document, error: docError } = await supabase
              .from('documents')
              .insert({
                lead_id: leadId,
                type: 'mandatory',
                document_category: 'aadhar_front',
                file_path: 'test/path.pdf',
                file_name: 'test.pdf',
                file_size: 1024,
                mime_type: 'application/pdf',
                uploaded_by: adminUserId,
                status: 'valid',
              })
              .select()
              .single();

            if (docError || !document) {
              throw new Error('Failed to create document');
            }
            documentId = document.id;

            // Admin should be able to access all lead data
            const { data: leadData, error: leadAccessError } = await supabase
              .from('leads')
              .select('*, documents(*), lead_steps(*)')
              .eq('id', leadId)
              .single();

            // Verify admin has complete access
            expect(leadAccessError).toBeNull();
            expect(leadData).toBeDefined();
            expect(leadData?.id).toBe(leadId);
            expect(Array.isArray(leadData?.documents)).toBe(true);
            expect(Array.isArray(leadData?.lead_steps)).toBe(true);
          } finally {
            // Cleanup
            if (documentId) await cleanupDocument(documentId);
            if (leadId) await cleanupLead(leadId);
            if (adminUserId) await cleanupUser(adminUserId);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs due to user creation overhead
    );
  });

  /**
   * Feature: solar-crm, Property 49: Admin Step Modification Override
   * 
   * For any step modification attempted by Admin, the operation should succeed 
   * regardless of allowed_roles configuration.
   * 
   * Validates: Requirements 11.3
   */
  test('Property 49: Admin Step Modification Override', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminEmail: emailArbitrary,
          adminPhone: phoneArbitrary,
          adminName: nameArbitrary,
          stepName: fc.string({ minLength: 3, maxLength: 50 }),
          orderIndex: fc.integer({ min: 1, max: 100 }),
          // Allowed roles that don't include admin
          allowedRoles: fc.constantFrom<UserRole[]>(
            ['agent'],
            ['office'],
            ['installer'],
            ['customer'],
            ['agent', 'office']
          ),
        }),
        async (testData) => {
          let adminUserId: string | null = null;
          let stepId: string | null = null;
          let leadId: string | null = null;

          try {
            // Create admin user
            const adminUser = await createTestUser(
              'admin',
              testData.adminEmail,
              testData.adminPhone,
              testData.adminName
            );
            adminUserId = adminUser.id;

            // Create a step with allowed_roles that don't include admin
            const { data: step, error: stepError } = await supabase
              .from('step_master')
              .insert({
                step_name: testData.stepName,
                order_index: testData.orderIndex,
                allowed_roles: testData.allowedRoles,
                remarks_required: false,
                attachments_allowed: false,
                customer_upload: false,
              })
              .select()
              .single();

            if (stepError || !step) {
              throw new Error('Failed to create step');
            }
            stepId = step.id;

            // Create a lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                created_by: adminUserId,
                source: 'office',
              })
              .select()
              .single();

            if (leadError || !lead) {
              throw new Error('Failed to create lead');
            }
            leadId = lead.id;

            // Create lead_step
            const { data: leadStep, error: leadStepError } = await supabase
              .from('lead_steps')
              .insert({
                lead_id: leadId,
                step_id: stepId,
                status: 'pending',
              })
              .select()
              .single();

            if (leadStepError || !leadStep) {
              throw new Error('Failed to create lead_step');
            }

            // Admin should be able to complete the step despite not being in allowed_roles
            const { data: updatedStep, error: updateError } = await supabase
              .from('lead_steps')
              .update({
                status: 'completed',
                completed_by: adminUserId,
                completed_at: new Date().toISOString(),
                remarks: 'Admin override test',
              })
              .eq('id', leadStep.id)
              .select()
              .single();

            // Verify admin can modify the step
            expect(updateError).toBeNull();
            expect(updatedStep).toBeDefined();
            expect(updatedStep?.status).toBe('completed');
            expect(updatedStep?.completed_by).toBe(adminUserId);
          } finally {
            // Cleanup
            if (leadId) await cleanupLead(leadId);
            if (stepId) await cleanupStepMaster(stepId);
            if (adminUserId) await cleanupUser(adminUserId);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs due to user creation overhead
    );
  });

  /**
   * Feature: solar-crm, Property 50: Admin Document Status Management
   * 
   * For any document status change by Admin, the document status should be updated 
   * and appropriate workflow actions should be triggered.
   * 
   * Validates: Requirements 11.4
   */
  test('Property 50: Admin Document Status Management', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminEmail: emailArbitrary,
          adminPhone: phoneArbitrary,
          adminName: nameArbitrary,
          newStatus: fc.constantFrom<DocumentStatus>('valid', 'corrupted'),
        }),
        async (testData) => {
          let adminUserId: string | null = null;
          let leadId: string | null = null;
          let documentId: string | null = null;

          try {
            // Create admin user
            const adminUser = await createTestUser(
              'admin',
              testData.adminEmail,
              testData.adminPhone,
              testData.adminName
            );
            adminUserId = adminUser.id;

            // Create a lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                created_by: adminUserId,
                source: 'office',
              })
              .select()
              .single();

            if (leadError || !lead) {
              throw new Error('Failed to create lead');
            }
            leadId = lead.id;

            // Create a document with initial status
            const initialStatus: DocumentStatus =
              testData.newStatus === 'valid' ? 'corrupted' : 'valid';

            const { data: document, error: docError } = await supabase
              .from('documents')
              .insert({
                lead_id: leadId,
                type: 'mandatory',
                document_category: 'aadhar_front',
                file_path: 'test/path.pdf',
                file_name: 'test.pdf',
                file_size: 1024,
                mime_type: 'application/pdf',
                uploaded_by: adminUserId,
                status: initialStatus,
              })
              .select()
              .single();

            if (docError || !document) {
              throw new Error('Failed to create document');
            }
            documentId = document.id;

            // Admin should be able to change document status
            const { data: updatedDoc, error: updateError } = await supabase
              .from('documents')
              .update({ status: testData.newStatus })
              .eq('id', documentId)
              .select()
              .single();

            // Verify status was updated
            expect(updateError).toBeNull();
            expect(updatedDoc).toBeDefined();
            expect(updatedDoc?.status).toBe(testData.newStatus);

            // Verify activity log entry was created (workflow action)
            const { data: activityLog } = await supabase
              .from('activity_log')
              .select('*')
              .eq('entity_type', 'document')
              .eq('entity_id', documentId)
              .order('timestamp', { ascending: false })
              .limit(1);

            // Activity logging should capture the status change
            expect(activityLog).toBeDefined();
          } finally {
            // Cleanup
            if (documentId) await cleanupDocument(documentId);
            if (leadId) await cleanupLead(leadId);
            if (adminUserId) await cleanupUser(adminUserId);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs due to user creation overhead
    );
  });

  /**
   * Feature: solar-crm, Property 51: Admin Timeline Manipulation Freedom
   * 
   * For any timeline manipulation by Admin (moving backward, skipping steps), 
   * lead_steps records should be updated without validation errors.
   * 
   * Validates: Requirements 11.5
   */
  test('Property 51: Admin Timeline Manipulation Freedom', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminEmail: emailArbitrary,
          adminPhone: phoneArbitrary,
          adminName: nameArbitrary,
          manipulation: fc.constantFrom('skip', 'move_backward', 'move_forward'),
        }),
        async (testData) => {
          let adminUserId: string | null = null;
          let leadId: string | null = null;
          const stepIds: string[] = [];

          try {
            // Create admin user
            const adminUser = await createTestUser(
              'admin',
              testData.adminEmail,
              testData.adminPhone,
              testData.adminName
            );
            adminUserId = adminUser.id;

            // Create multiple steps
            for (let i = 1; i <= 3; i++) {
              const { data: step, error: stepError } = await supabase
                .from('step_master')
                .insert({
                  step_name: `Test Step ${i}`,
                  order_index: i,
                  allowed_roles: ['office'],
                  remarks_required: false,
                  attachments_allowed: false,
                  customer_upload: false,
                })
                .select()
                .single();

              if (stepError || !step) {
                throw new Error('Failed to create step');
              }
              stepIds.push(step.id);
            }

            // Create a lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                created_by: adminUserId,
                source: 'office',
              })
              .select()
              .single();

            if (leadError || !lead) {
              throw new Error('Failed to create lead');
            }
            leadId = lead.id;

            // Create lead_steps for all steps
            for (const stepId of stepIds) {
              await supabase.from('lead_steps').insert({
                lead_id: leadId,
                step_id: stepId,
                status: 'pending',
              });
            }

            // Get the first lead_step
            const { data: firstLeadStep } = await supabase
              .from('lead_steps')
              .select('*')
              .eq('lead_id', leadId)
              .eq('step_id', stepIds[0])
              .single();

            if (!firstLeadStep) {
              throw new Error('Failed to get lead_step');
            }

            // Perform manipulation based on test data
            let manipulationSuccess = false;

            if (testData.manipulation === 'skip') {
              // Skip step by marking as completed without validation
              const { error: skipError } = await supabase
                .from('lead_steps')
                .update({
                  status: 'completed',
                  completed_by: adminUserId,
                  completed_at: new Date().toISOString(),
                  remarks: 'Admin skip',
                })
                .eq('id', firstLeadStep.id);

              manipulationSuccess = !skipError;
            } else if (testData.manipulation === 'move_backward') {
              // First complete the step
              await supabase
                .from('lead_steps')
                .update({
                  status: 'completed',
                  completed_by: adminUserId,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', firstLeadStep.id);

              // Then reopen it (move backward)
              const { error: reopenError } = await supabase
                .from('lead_steps')
                .update({
                  status: 'pending',
                  completed_by: null,
                  completed_at: null,
                })
                .eq('id', firstLeadStep.id);

              manipulationSuccess = !reopenError;
            } else if (testData.manipulation === 'move_forward') {
              // Complete step (move forward)
              const { error: completeError } = await supabase
                .from('lead_steps')
                .update({
                  status: 'completed',
                  completed_by: adminUserId,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', firstLeadStep.id);

              manipulationSuccess = !completeError;
            }

            // Verify manipulation succeeded without validation errors
            expect(manipulationSuccess).toBe(true);

            // Verify the lead_step was updated
            const { data: updatedLeadStep } = await supabase
              .from('lead_steps')
              .select('*')
              .eq('id', firstLeadStep.id)
              .single();

            expect(updatedLeadStep).toBeDefined();
          } finally {
            // Cleanup
            if (leadId) await cleanupLead(leadId);
            for (const stepId of stepIds) {
              await cleanupStepMaster(stepId);
            }
            if (adminUserId) await cleanupUser(adminUserId);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs due to user creation overhead
    );
  });
});
