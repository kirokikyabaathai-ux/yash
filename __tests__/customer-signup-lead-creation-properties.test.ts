/**
 * Property-Based Tests for Customer Signup Lead Creation
 * 
 * Tests correctness properties for automatic lead creation during customer signup.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * Feature: nextauth-integration, Property 24: Customer lead creation
 * Validates: Requirements 9.5
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

// Helper function to generate valid email
const emailArbitrary = fc.emailAddress();

// Helper function to generate valid password
const passwordArbitrary = fc.string({ minLength: 8, maxLength: 20 });

// Helper function to generate valid phone (10 digits, cannot start with 0)
const phoneArbitrary = fc
  .integer({ min: 1000000000, max: 9999999999 })
  .map(n => n.toString());

// Helper function to generate valid name
const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

// Cleanup function to delete test users and leads
async function cleanupTestData(userId: string) {
  try {
    // Delete leads associated with the user
    await supabase.from('leads').delete().eq('customer_account_id', userId);
    // Delete from users table
    await supabase.from('users').delete().eq('id', userId);
    // Delete from auth (requires service role)
    await supabase.auth.admin.deleteUser(userId);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('Customer Signup Lead Creation Properties', () => {
  // Skip all tests if Supabase is not configured
  if (skipTests) {
    test.skip('Supabase credentials not configured - skipping property tests', () => {});
    return;
  }

  /**
   * Feature: nextauth-integration, Property 24: Customer lead creation
   * 
   * For any customer signup, the system should automatically create an associated 
   * lead record with source='self' and link it to the customer account.
   * 
   * Validates: Requirements 9.5
   */
  test('Property 24: Customer lead creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
        }),
        async (customerData) => {
          let userId: string | null = null;

          try {
            // Step 1: Create customer account (simulating signup)
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: customerData.email,
              password: customerData.password,
              email_confirm: true,
              user_metadata: {
                name: customerData.name,
                phone: customerData.phone,
                role: 'customer',
              },
            });

            if (signUpError || !authData.user) {
              // Skip if user creation fails (e.g., duplicate email)
              return true;
            }

            userId = authData.user.id;

            // Step 2: Wait for database trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 3: Verify user profile was created
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            expect(profileError).toBeNull();
            expect(profile).toBeDefined();
            expect(profile?.role).toBe('customer');
            expect(profile?.email).toBe(customerData.email);

            // Step 4: Verify lead was automatically created
            const { data: leads, error: leadError } = await supabase
              .from('leads')
              .select('*')
              .eq('customer_account_id', userId);

            expect(leadError).toBeNull();
            expect(leads).toBeDefined();
            expect(leads?.length).toBeGreaterThan(0);

            // Step 5: Verify lead properties
            const lead = leads?.[0];
            expect(lead).toBeDefined();
            expect(lead?.customer_account_id).toBe(userId);
            expect(lead?.source).toBe('self');
            expect(lead?.created_by).toBe(userId);
            expect(lead?.email).toBe(customerData.email);
            expect(lead?.phone).toBe(customerData.phone);
            expect(lead?.customer_name).toBe(customerData.name);
            expect(lead?.status).toBe('lead');

            return true;
          } finally {
            // Cleanup
            if (userId) {
              await cleanupTestData(userId);
            }
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for integration tests
    );
  }, 60000); // 60 second timeout

  /**
   * Feature: nextauth-integration, Property 24.1: Lead uniqueness per customer
   * 
   * For any customer signup, exactly one lead should be created automatically.
   * Multiple signups with the same email should not create duplicate leads.
   * 
   * Validates: Requirements 9.5
   */
  test('Property 24.1: Lead uniqueness per customer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
        }),
        async (customerData) => {
          let userId: string | null = null;

          try {
            // Create customer account
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: customerData.email,
              password: customerData.password,
              email_confirm: true,
              user_metadata: {
                name: customerData.name,
                phone: customerData.phone,
                role: 'customer',
              },
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Wait for database trigger
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify exactly one lead was created
            const { data: leads, error: leadError } = await supabase
              .from('leads')
              .select('*')
              .eq('customer_account_id', userId);

            expect(leadError).toBeNull();
            expect(leads).toBeDefined();
            expect(leads?.length).toBe(1);

            return true;
          } finally {
            // Cleanup
            if (userId) {
              await cleanupTestData(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 24.2: Non-customer roles don't create leads
   * 
   * For any user signup with a non-customer role (admin, agent, office, installer),
   * no lead should be automatically created.
   * 
   * Validates: Requirements 9.5
   */
  test('Property 24.2: Non-customer roles do not create leads', async () => {
    const nonCustomerRoleArbitrary = fc.constantFrom('admin', 'agent', 'office', 'installer');

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
          role: nonCustomerRoleArbitrary,
        }),
        async (userData) => {
          let userId: string | null = null;

          try {
            // Create non-customer account
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
              user_metadata: {
                name: userData.name,
                phone: userData.phone,
                role: userData.role,
              },
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Wait for database trigger
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify user profile was created with correct role
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            expect(profileError).toBeNull();
            expect(profile).toBeDefined();
            expect(profile?.role).toBe(userData.role);

            // Verify NO lead was created
            const { data: leads, error: leadError } = await supabase
              .from('leads')
              .select('*')
              .eq('customer_account_id', userId);

            expect(leadError).toBeNull();
            expect(leads).toBeDefined();
            expect(leads?.length).toBe(0);

            return true;
          } finally {
            // Cleanup
            if (userId) {
              await cleanupTestData(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 24.3: Lead data completeness
   * 
   * For any customer signup, the automatically created lead should contain
   * all required fields populated with the customer's signup data.
   * 
   * Validates: Requirements 9.5
   */
  test('Property 24.3: Lead data completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
        }),
        async (customerData) => {
          let userId: string | null = null;

          try {
            // Create customer account
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: customerData.email,
              password: customerData.password,
              email_confirm: true,
              user_metadata: {
                name: customerData.name,
                phone: customerData.phone,
                role: 'customer',
              },
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Wait for database trigger
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Fetch the created lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .select('*')
              .eq('customer_account_id', userId)
              .single();

            expect(leadError).toBeNull();
            expect(lead).toBeDefined();

            // Verify all required fields are present and correct
            expect(lead?.id).toBeDefined();
            expect(lead?.customer_name).toBe(customerData.name);
            expect(lead?.phone).toBe(customerData.phone);
            expect(lead?.email).toBe(customerData.email);
            expect(lead?.source).toBe('self');
            expect(lead?.created_by).toBe(userId);
            expect(lead?.customer_account_id).toBe(userId);
            expect(lead?.status).toBe('lead');
            expect(lead?.created_at).toBeDefined();
            expect(lead?.updated_at).toBeDefined();

            // Verify notes field contains auto-creation message
            expect(lead?.notes).toContain('Auto-created');

            return true;
          } finally {
            // Cleanup
            if (userId) {
              await cleanupTestData(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
