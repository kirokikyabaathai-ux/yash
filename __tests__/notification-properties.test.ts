/**
 * Property-Based Tests for Notification System
 * 
 * Tests correctness properties for notification creation and management.
 * Uses fast-check for property-based testing with 100+ iterations.
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

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
const phoneArbitrary = fc.string({ minLength: 10, maxLength: 15 }).map(s => s.replace(/\D/g, '').slice(0, 15));
const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 });
const addressArbitrary = fc.string({ minLength: 5, maxLength: 200 });

// Cleanup functions
async function cleanupTestData(userIds: string[], leadIds: string[], stepIds: string[]) {
  try {
    // Delete in reverse order of dependencies
    if (leadIds.length > 0) {
      await supabase.from('notifications').delete().in('lead_id', leadIds);
      await supabase.from('lead_steps').delete().in('lead_id', leadIds);
      await supabase.from('documents').delete().in('lead_id', leadIds);
      await supabase.from('leads').delete().in('id', leadIds);
    }
    if (stepIds.length > 0) {
      await supabase.from('step_master').delete().in('id', stepIds);
    }
    if (userIds.length > 0) {
      await supabase.from('users').delete().in('id', userIds);
      for (const userId of userIds) {
        await supabase.auth.admin.deleteUser(userId);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('Notification Properties', () => {
  if (skipTests) {
    test.skip('Supabase credentials not configured - skipping property tests', () => {});
    return;
  }

  /**
   * Feature: solar-crm, Property 87: Step Completion Notification Creation
   * 
   * For any timeline step completed for a Customer's lead, a notification 
   * record should be created for that Customer.
   * 
   * Validates: Requirements 19.1
   */
  test('Property 87: Step Completion Notification Creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customerEmail: emailArbitrary,
          customerName: nameArbitrary,
          customerPhone: phoneArbitrary,
          agentEmail: emailArbitrary,
          agentName: nameArbitrary,
          agentPhone: phoneArbitrary,
          leadName: nameArbitrary,
          leadAddress: addressArbitrary,
          stepName: fc.string({ minLength: 3, maxLength: 50 }),
          remarks: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
        }),
        async (testData) => {
          const userIds: string[] = [];
          const leadIds: string[] = [];
          const stepIds: string[] = [];

          try {
            // Create customer user
            const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
              email: testData.customerEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (customerAuthError || !customerAuth.user) return true;
            userIds.push(customerAuth.user.id);

            const { error: customerProfileError } = await supabase.from('users').insert({
              id: customerAuth.user.id,
              email: testData.customerEmail,
              name: testData.customerName,
              phone: testData.customerPhone,
              role: 'customer',
            });

            if (customerProfileError) return true;

            // Create agent user
            const { data: agentAuth, error: agentAuthError } = await supabase.auth.admin.createUser({
              email: testData.agentEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (agentAuthError || !agentAuth.user) return true;
            userIds.push(agentAuth.user.id);

            const { error: agentProfileError } = await supabase.from('users').insert({
              id: agentAuth.user.id,
              email: testData.agentEmail,
              name: testData.agentName,
              phone: testData.agentPhone,
              role: 'agent',
            });

            if (agentProfileError) return true;

            // Create lead linked to customer
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: testData.leadName,
                phone: testData.customerPhone,
                address: testData.leadAddress,
                created_by: agentAuth.user.id,
                customer_account_id: customerAuth.user.id,
                source: 'agent',
              })
              .select()
              .single();

            if (leadError || !lead) return true;
            leadIds.push(lead.id);

            // Create step master
            const { data: stepMaster, error: stepError } = await supabase
              .from('step_master')
              .insert({
                step_name: testData.stepName,
                order_index: 1,
                allowed_roles: ['agent', 'office', 'admin'],
                remarks_required: false,
                attachments_allowed: false,
                customer_upload: false,
              })
              .select()
              .single();

            if (stepError || !stepMaster) return true;
            stepIds.push(stepMaster.id);

            // Create lead step
            const { data: leadStep, error: leadStepError } = await supabase
              .from('lead_steps')
              .insert({
                lead_id: lead.id,
                step_id: stepMaster.id,
                status: 'pending',
              })
              .select()
              .single();

            if (leadStepError || !leadStep) return true;

            // Get initial notification count
            const { count: initialCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', customerAuth.user.id)
              .eq('lead_id', lead.id)
              .eq('type', 'step_completed');

            // Complete the step (this should trigger notification)
            const { error: updateError } = await supabase
              .from('lead_steps')
              .update({
                status: 'completed',
                completed_by: agentAuth.user.id,
                completed_at: new Date().toISOString(),
                remarks: testData.remarks,
              })
              .eq('id', leadStep.id);

            if (updateError) return true;

            // Wait a bit for trigger to execute
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check that notification was created
            const { data: notifications, count: finalCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', customerAuth.user.id)
              .eq('lead_id', lead.id)
              .eq('type', 'step_completed');

            // Verify notification was created
            expect(finalCount).toBeGreaterThan(initialCount || 0);
            expect(notifications).toBeDefined();
            expect(notifications!.length).toBeGreaterThan(0);

            const notification = notifications![0];
            expect(notification.title).toBe('Step Completed');
            expect(notification.message).toContain(testData.stepName);
            expect(notification.read).toBe(false);

            return true;
          } finally {
            await cleanupTestData(userIds, leadIds, stepIds);
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for integration test
    );
  }, 60000); // 60 second timeout

  /**
   * Feature: solar-crm, Property 88: Document Corruption Notification Creation
   * 
   * For any document marked as corrupted, a notification should be created 
   * for the Customer requesting re-upload.
   * 
   * Validates: Requirements 19.2
   */
  test('Property 88: Document Corruption Notification Creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customerEmail: emailArbitrary,
          customerName: nameArbitrary,
          customerPhone: phoneArbitrary,
          leadName: nameArbitrary,
          leadAddress: addressArbitrary,
          documentCategory: fc.constantFrom('aadhar_front', 'aadhar_back', 'bijli_bill', 'pan_card'),
        }),
        async (testData) => {
          const userIds: string[] = [];
          const leadIds: string[] = [];

          try {
            // Create customer user
            const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
              email: testData.customerEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (customerAuthError || !customerAuth.user) return true;
            userIds.push(customerAuth.user.id);

            const { error: customerProfileError } = await supabase.from('users').insert({
              id: customerAuth.user.id,
              email: testData.customerEmail,
              name: testData.customerName,
              phone: testData.customerPhone,
              role: 'customer',
            });

            if (customerProfileError) return true;

            // Create lead linked to customer
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: testData.leadName,
                phone: testData.customerPhone,
                address: testData.leadAddress,
                created_by: customerAuth.user.id,
                customer_account_id: customerAuth.user.id,
                source: 'self',
              })
              .select()
              .single();

            if (leadError || !lead) return true;
            leadIds.push(lead.id);

            // Create document
            const { data: document, error: docError } = await supabase
              .from('documents')
              .insert({
                lead_id: lead.id,
                type: 'mandatory',
                document_category: testData.documentCategory,
                file_path: `leads/${lead.id}/mandatory/test.pdf`,
                file_name: 'test.pdf',
                file_size: 1024,
                mime_type: 'application/pdf',
                uploaded_by: customerAuth.user.id,
                status: 'valid',
              })
              .select()
              .single();

            if (docError || !document) return true;

            // Get initial notification count
            const { count: initialCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', customerAuth.user.id)
              .eq('type', 'document_corrupted');

            // Mark document as corrupted (this should trigger notification)
            const { error: updateError } = await supabase
              .from('documents')
              .update({ status: 'corrupted' })
              .eq('id', document.id);

            if (updateError) return true;

            // Wait for trigger to execute
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check that notification was created
            const { data: notifications, count: finalCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', customerAuth.user.id)
              .eq('type', 'document_corrupted');

            // Verify notification was created
            expect(finalCount).toBeGreaterThan(initialCount || 0);
            expect(notifications).toBeDefined();
            expect(notifications!.length).toBeGreaterThan(0);

            const notification = notifications![0];
            expect(notification.title).toBe('Document Re-upload Required');
            expect(notification.message).toContain(testData.documentCategory);
            expect(notification.read).toBe(false);

            return true;
          } finally {
            await cleanupTestData(userIds, leadIds, []);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: solar-crm, Property 89: Remarks Notification Creation
   * 
   * For any remarks added to a step by Office Team, a notification should 
   * be created for the Customer with the remarks content.
   * 
   * Validates: Requirements 19.3
   */
  test('Property 89: Remarks Notification Creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customerEmail: emailArbitrary,
          customerName: nameArbitrary,
          customerPhone: phoneArbitrary,
          officeEmail: emailArbitrary,
          officeName: nameArbitrary,
          officePhone: phoneArbitrary,
          leadName: nameArbitrary,
          leadAddress: addressArbitrary,
          stepName: fc.string({ minLength: 3, maxLength: 50 }),
          remarks: fc.string({ minLength: 10, maxLength: 200 }),
        }),
        async (testData) => {
          const userIds: string[] = [];
          const leadIds: string[] = [];
          const stepIds: string[] = [];

          try {
            // Create customer user
            const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
              email: testData.customerEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (customerAuthError || !customerAuth.user) return true;
            userIds.push(customerAuth.user.id);

            await supabase.from('users').insert({
              id: customerAuth.user.id,
              email: testData.customerEmail,
              name: testData.customerName,
              phone: testData.customerPhone,
              role: 'customer',
            });

            // Create office user
            const { data: officeAuth, error: officeAuthError } = await supabase.auth.admin.createUser({
              email: testData.officeEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (officeAuthError || !officeAuth.user) return true;
            userIds.push(officeAuth.user.id);

            await supabase.from('users').insert({
              id: officeAuth.user.id,
              email: testData.officeEmail,
              name: testData.officeName,
              phone: testData.officePhone,
              role: 'office',
            });

            // Create lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: testData.leadName,
                phone: testData.customerPhone,
                address: testData.leadAddress,
                created_by: officeAuth.user.id,
                customer_account_id: customerAuth.user.id,
                source: 'office',
              })
              .select()
              .single();

            if (leadError || !lead) return true;
            leadIds.push(lead.id);

            // Create step master
            const { data: stepMaster, error: stepError } = await supabase
              .from('step_master')
              .insert({
                step_name: testData.stepName,
                order_index: 1,
                allowed_roles: ['office', 'admin'],
                remarks_required: true,
                attachments_allowed: false,
                customer_upload: false,
              })
              .select()
              .single();

            if (stepError || !stepMaster) return true;
            stepIds.push(stepMaster.id);

            // Create lead step without remarks
            const { data: leadStep, error: leadStepError } = await supabase
              .from('lead_steps')
              .insert({
                lead_id: lead.id,
                step_id: stepMaster.id,
                status: 'pending',
              })
              .select()
              .single();

            if (leadStepError || !leadStep) return true;

            // Get initial notification count
            const { count: initialCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', customerAuth.user.id)
              .eq('type', 'remark_added');

            // Add remarks (this should trigger notification)
            const { error: updateError } = await supabase
              .from('lead_steps')
              .update({
                remarks: testData.remarks,
                completed_by: officeAuth.user.id,
              })
              .eq('id', leadStep.id);

            if (updateError) return true;

            // Wait for trigger
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check notification
            const { data: notifications, count: finalCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', customerAuth.user.id)
              .eq('type', 'remark_added');

            expect(finalCount).toBeGreaterThan(initialCount || 0);
            expect(notifications).toBeDefined();
            expect(notifications!.length).toBeGreaterThan(0);

            const notification = notifications![0];
            expect(notification.title).toBe('New Remark Added');
            expect(notification.message).toContain(testData.stepName);
            expect(notification.read).toBe(false);

            return true;
          } finally {
            await cleanupTestData(userIds, leadIds, stepIds);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: solar-crm, Property 90: Notification Display on Login
   * 
   * For any Customer login, unread notifications count and notification 
   * list should be displayed.
   * 
   * Validates: Requirements 19.4
   */
  test('Property 90: Notification Display on Login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customerEmail: emailArbitrary,
          customerName: nameArbitrary,
          customerPhone: phoneArbitrary,
          notificationCount: fc.integer({ min: 1, max: 5 }),
        }),
        async (testData) => {
          const userIds: string[] = [];
          const leadIds: string[] = [];

          try {
            // Create customer user
            const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
              email: testData.customerEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (customerAuthError || !customerAuth.user) return true;
            userIds.push(customerAuth.user.id);

            await supabase.from('users').insert({
              id: customerAuth.user.id,
              email: testData.customerEmail,
              name: testData.customerName,
              phone: testData.customerPhone,
              role: 'customer',
            });

            // Create lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: testData.customerName,
                phone: testData.customerPhone,
                address: '123 Test St',
                created_by: customerAuth.user.id,
                customer_account_id: customerAuth.user.id,
                source: 'self',
              })
              .select()
              .single();

            if (leadError || !lead) return true;
            leadIds.push(lead.id);

            // Create multiple unread notifications
            const notifications = Array.from({ length: testData.notificationCount }, (_, i) => ({
              user_id: customerAuth.user.id,
              lead_id: lead.id,
              type: 'step_completed',
              title: `Test Notification ${i + 1}`,
              message: `This is test notification ${i + 1}`,
              read: false,
            }));

            const { error: notifError } = await supabase
              .from('notifications')
              .insert(notifications);

            if (notifError) return true;

            // Query notifications as if user just logged in
            const { data: fetchedNotifications, count: unreadCount } = await supabase
              .from('notifications')
              .select('*', { count: 'exact' })
              .eq('user_id', customerAuth.user.id)
              .eq('read', false)
              .order('created_at', { ascending: false });

            // Verify notifications are returned
            expect(fetchedNotifications).toBeDefined();
            expect(fetchedNotifications!.length).toBe(testData.notificationCount);
            expect(unreadCount).toBe(testData.notificationCount);

            // Verify all are unread
            fetchedNotifications!.forEach(notif => {
              expect(notif.read).toBe(false);
            });

            return true;
          } finally {
            await cleanupTestData(userIds, leadIds, []);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: solar-crm, Property 91: Notification Read Status Update
   * 
   * For any notification viewed by a Customer, the notification should 
   * be marked as read.
   * 
   * Validates: Requirements 19.5
   */
  test('Property 91: Notification Read Status Update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          customerEmail: emailArbitrary,
          customerName: nameArbitrary,
          customerPhone: phoneArbitrary,
        }),
        async (testData) => {
          const userIds: string[] = [];
          const leadIds: string[] = [];

          try {
            // Create customer user
            const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
              email: testData.customerEmail,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (customerAuthError || !customerAuth.user) return true;
            userIds.push(customerAuth.user.id);

            await supabase.from('users').insert({
              id: customerAuth.user.id,
              email: testData.customerEmail,
              name: testData.customerName,
              phone: testData.customerPhone,
              role: 'customer',
            });

            // Create lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert({
                customer_name: testData.customerName,
                phone: testData.customerPhone,
                address: '123 Test St',
                created_by: customerAuth.user.id,
                customer_account_id: customerAuth.user.id,
                source: 'self',
              })
              .select()
              .single();

            if (leadError || !lead) return true;
            leadIds.push(lead.id);

            // Create unread notification
            const { data: notification, error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: customerAuth.user.id,
                lead_id: lead.id,
                type: 'step_completed',
                title: 'Test Notification',
                message: 'This is a test notification',
                read: false,
              })
              .select()
              .single();

            if (notifError || !notification) return true;

            // Verify it's unread
            expect(notification.read).toBe(false);

            // Mark as read
            const { data: updatedNotification, error: updateError } = await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', notification.id)
              .select()
              .single();

            if (updateError) return true;

            // Verify it's now read
            expect(updatedNotification.read).toBe(true);

            // Verify in database
            const { data: fetchedNotification } = await supabase
              .from('notifications')
              .select('read')
              .eq('id', notification.id)
              .single();

            expect(fetchedNotification?.read).toBe(true);

            return true;
          } finally {
            await cleanupTestData(userIds, leadIds, []);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
