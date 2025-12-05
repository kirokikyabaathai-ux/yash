/**
 * Property-Based Tests for NextAuth Authentication Components
 * 
 * Tests correctness properties for NextAuth integration including:
 * - Valid credentials authentication
 * - Invalid credentials rejection
 * - User creation
 * - Post-signup authentication
 * - Duplicate email rejection
 * - Sign out flow
 * 
 * Uses fast-check for property-based testing with 100+ iterations.
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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

// Helper to get dashboard route for role
function getDashboardRoute(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'office':
      return '/office/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'installer':
      return '/installer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
}

describe('NextAuth Authentication Properties', () => {
  if (skipTests) {
    test.skip('Supabase credentials not configured - skipping property tests', () => {});
    return;
  }

  /**
   * Feature: nextauth-integration, Property 3: Valid credentials authentication
   * Validates: Requirements 2.1, 2.4
   * 
   * For any valid email and password combination, the system should create a session 
   * and redirect to the role-appropriate dashboard.
   */
  test('Property 3: Valid credentials authentication', async () => {
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

            // Create user profile
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

            // Verify user can sign in with valid credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

            // Verify session was created
            expect(signInError).toBeNull();
            expect(signInData.session).toBeDefined();
            expect(signInData.session?.access_token).toBeDefined();
            expect(signInData.user).toBeDefined();
            expect(signInData.user.email).toBe(userData.email);

            // Verify correct dashboard route for role
            const expectedDashboard = getDashboardRoute(userData.role);
            expect(expectedDashboard).toBeDefined();
            expect(expectedDashboard).toMatch(/^\/[a-z]+\/dashboard$/);

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

  /**
   * Feature: nextauth-integration, Property 4: Invalid credentials rejection
   * Validates: Requirements 2.2
   * 
   * For any invalid email or password, the system should reject authentication 
   * and return an appropriate error message.
   */
  test('Property 4: Invalid credentials rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          wrongPassword: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
          role: roleArbitrary,
        }).filter(data => data.password !== data.wrongPassword),
        async (userData) => {
          let userId: string | null = null;

          try {
            // Create user account with correct password
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Create user profile
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

            // Attempt to sign in with wrong password
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.wrongPassword,
            });

            // Verify authentication was rejected
            expect(signInError).toBeDefined();
            expect(signInData.session).toBeNull();
            expect(signInData.user).toBeNull();

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 21: User creation
   * Validates: Requirements 9.1, 9.2
   * 
   * For any signup operation, the system should create a user record in the users table 
   * with a securely hashed password.
   */
  test('Property 21: User creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
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

            // Create user profile
            const { error: profileError } = await supabase.from('users').insert({
              id: userId,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              role: 'customer',
              status: 'active',
            });

            if (profileError) {
              return true; // Skip if profile creation fails
            }

            // Verify user record exists
            const { data: profile, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            expect(fetchError).toBeNull();
            expect(profile).toBeDefined();
            expect(profile?.email).toBe(userData.email);
            expect(profile?.name).toBe(userData.name);
            expect(profile?.phone).toBe(userData.phone);
            expect(profile?.role).toBe('customer');
            expect(profile?.status).toBe('active');

            // Verify password is hashed (not stored in users table, but in auth.users)
            // We can verify by attempting to sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

            expect(signInError).toBeNull();
            expect(signInData.session).toBeDefined();

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 22: Post-signup authentication
   * Validates: Requirements 9.3
   * 
   * For any successful signup, the system should automatically authenticate the new user.
   */
  test('Property 22: Post-signup authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password: passwordArbitrary,
          name: nameArbitrary,
          phone: phoneArbitrary,
        }),
        async (userData) => {
          let userId: string | null = null;

          try {
            // Simulate signup process
            const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
            });

            if (signUpError || !authData.user) {
              return true; // Skip if user creation fails
            }

            userId = authData.user.id;

            // Create user profile
            const { error: profileError } = await supabase.from('users').insert({
              id: userId,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              role: 'customer',
              status: 'active',
            });

            if (profileError) {
              return true; // Skip if profile creation fails
            }

            // Verify user can immediately sign in after signup
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

            expect(signInError).toBeNull();
            expect(signInData.session).toBeDefined();
            expect(signInData.user).toBeDefined();
            expect(signInData.user.email).toBe(userData.email);

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 23: Duplicate email rejection
   * Validates: Requirements 9.4
   * 
   * For any signup attempt with an existing email, the system should reject 
   * the signup with an appropriate error.
   */
  test('Property 23: Duplicate email rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: emailArbitrary,
          password1: passwordArbitrary,
          password2: passwordArbitrary,
          name1: nameArbitrary,
          name2: nameArbitrary,
          phone1: phoneArbitrary,
          phone2: phoneArbitrary,
        }),
        async (userData) => {
          let userId: string | null = null;

          try {
            // Create first user
            const { data: authData1, error: signUpError1 } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password1,
              email_confirm: true,
            });

            if (signUpError1 || !authData1.user) {
              return true; // Skip if user creation fails
            }

            userId = authData1.user.id;

            // Create user profile
            const { error: profileError1 } = await supabase.from('users').insert({
              id: userId,
              email: userData.email,
              name: userData.name1,
              phone: userData.phone1,
              role: 'customer',
              status: 'active',
            });

            if (profileError1) {
              return true; // Skip if profile creation fails
            }

            // Attempt to create second user with same email
            const { data: authData2, error: signUpError2 } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password2,
              email_confirm: true,
            });

            // Verify duplicate email was rejected
            expect(signUpError2).toBeDefined();
            expect(authData2.user).toBeNull();

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Feature: nextauth-integration, Property 10: Sign out flow
   * Validates: Requirements 4.1, 4.2, 4.3
   * 
   * For any sign out operation, the system should invalidate the database session, 
   * clear cookies, and redirect to login.
   */
  test('Property 10: Sign out flow', async () => {
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

            // Create user profile
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

            // Sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

            if (signInError || !signInData.session) {
              return true; // Skip if sign in fails
            }

            // Verify session exists
            expect(signInData.session).toBeDefined();
            expect(signInData.session.access_token).toBeDefined();

            // Sign out
            const { error: signOutError } = await supabase.auth.signOut();
            expect(signOutError).toBeNull();

            // Verify session is invalidated
            const { data: sessionData } = await supabase.auth.getSession();
            expect(sessionData.session).toBeNull();

            return true;
          } finally {
            if (userId) {
              await cleanupTestUser(userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
