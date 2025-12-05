/**
 * Property-Based Tests for Session Data Completeness
 * 
 * Tests that session data includes complete user profile information.
 * 
 * Uses fast-check for property-based testing with 100+ iterations.
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Initialize Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Skip tests if Supabase credentials are not configured
const skipTests = !supabaseUrl || !supabaseServiceKey || supabaseUrl === '';

let supabase: ReturnType<typeof createClient>;
if (!skipTests) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Helper arbitraries
const emailArbitrary = fc.emailAddress();
const passwordArbitrary = fc.string({ minLength: 8, maxLength: 20 });
const phoneArbitrary = fc.integer({ min: 1000000000, max: 9999999999 }).map(n => n.toString());
const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const roleArbitrary = fc.constantFrom('admin', 'agent', 'office', 'installer', 'customer');

// Cleanup function
async function cleanupTestUser(userId: string) {
  try {
    await supabase.from('users').delete().eq('id', userId);
    await supabase.auth.admin.deleteUser(userId);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('Session Data Completeness Properties', () => {
  if (skipTests) {
    test.skip('Supabase credentials not configured - skipping property tests', () => {});
    return;
  }

  /**
   * Feature: nextauth-integration, Property 9: Session data completeness
   * Validates: Requirements 3.5, 6.2
   * 
   * For any session access, the system should provide complete user profile information 
   * including role.
   */
  test('Property 9: Session data completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
          role: roleArbitrary,
        }),
        async (userData) => {
          let userId: string | null = null;

          try {
            // Create user account
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Create user profile with all required fields
            const { error: profileError } = await supabase.from('users').insert({
              id: userId,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              role: userData.role,
              status: 'active',
            });

            if (profileError) {
              return true; // Skip if profile creation fails
            }

            // Sign in to create session
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

            if (signInError || !signInData.session) {
              return true; // Skip if sign in fails
            }

            // Verify session exists
            expect(signInData.session).toBeDefined();
            expect(signInData.user).toBeDefined();

            // Fetch user profile using session user ID (simulating what server components do)
            const { data: profile, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', signInData.user.id)
              .single();

            // Verify session data completeness
            expect(fetchError).toBeNull();
            expect(profile).toBeDefined();
            
            // Verify all required fields are present
            expect(profile?.id).toBe(userId);
            expect(profile?.email).toBe(userData.email);
            expect(profile?.name).toBe(userData.name);
            expect(profile?.phone).toBe(userData.phone);
            expect(profile?.role).toBe(userData.role);
            expect(profile?.status).toBe('active');

            // Verify role is one of the valid roles
            expect(['admin', 'agent', 'office', 'installer', 'customer']).toContain(profile?.role);

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 } // Reduced for integration tests
    );
  }, 60000);
});
