# Implementation Plan: NextAuth Integration

This document outlines the step-by-step implementation tasks for integrating NextAuth into the YAS Natural Solar CRM application.

## Task List

- [x] 1. Install dependencies and setup NextAuth configuration





  - Install next-auth package and required dependencies
  - Create NextAuth configuration file with Supabase adapter
  - Set up environment variables for NextAuth
  - _Requirements: 1.1, 1.3_




- [ ] 2. Create NextAuth API routes

  - Create `/api/auth/[...nextauth]/route.ts` for NextAuth handler


  - Configure credentials provider for email/password authentication

  - Implement authorize function to validate against Supabase users table
  - _Requirements: 2.1, 2.2_







- [x] 3. Implement authentication utilities



  - Create auth helper functions for server-side session retrieval
  - Create auth helper functions for client-side session access
  - Implement password hashing utilities using bcrypt


  - _Requirements: 2.1, 9.2_



- [ ] 4. Create session management components

- [x] 4.1 Create SessionProvider wrapper component



  - Wrap application with NextAuth SessionProvider
  - Configure session refresh interval
  - _Requirements: 3.1, 3.2_

- [ ] 4.2 Write property test for session persistence
  - **Property 6: Session persistence**
  - **Validates: Requirements 3.1, 3.2**

- [ ] 4.3 Implement useSession hook wrapper
  - Create custom hook for accessing session in client components
  - Add loading state handling
  - _Requirements: 7.1, 7.4_

- [ ] 4.4 Write property test for client component reactivity
  - **Property 14: Client component reactivity**
  - **Validates: Requirements 7.2**

- [x] 5. Update middleware for NextAuth





- [x] 5.1 Modify middleware to use NextAuth session


  - Replace Supabase session checks with NextAuth session checks
  - Maintain existing route protection logic
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.2 Write property test for protected route access control


  - **Property 11: Protected route access control**
  - **Validates: Requirements 5.1, 5.2, 4.4_

- [x] 5.3 Write property test for middleware session verification


  - **Property 12: Middleware session verification**
  - **Validates: Requirements 5.3**

- [x] 5.4 Implement role-based authorization in middleware


  - Check user role from session
  - Enforce role restrictions for protected routes
  - _Requirements: 5.4, 5.5_

- [x] 5.5 Write property test for role-based authorization


  - **Property 13: Role-based authorization**
  - **Validates: Requirements 5.4, 5.5**

- [x] 6. Create authentication components



- [x] 6.1 Update LoginForm component


  - Replace Supabase signIn with NextAuth signIn
  - Handle authentication errors
  - Implement redirect logic based on user role
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 6.2 Write property test for valid credentials authentication


  - **Property 3: Valid credentials authentication**
  - **Validates: Requirements 2.1, 2.4**

- [x] 6.3 Write property test for invalid credentials rejection

  - **Property 4: Invalid credentials rejection**
  - **Validates: Requirements 2.2**

- [x] 6.4 Create SignUpForm component


  - Implement user registration with NextAuth
  - Hash passwords before storing
  - Create user record in Supabase users table
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 6.5 Write property test for user creation

  - **Property 21: User creation**
  - **Validates: Requirements 9.1, 9.2**

- [x] 6.6 Write property test for post-signup authentication

  - **Property 22: Post-signup authentication**
  - **Validates: Requirements 9.3**

- [x] 6.7 Write property test for duplicate email rejection

  - **Property 23: Duplicate email rejection**
  - **Validates: Requirements 9.4**

- [x] 6.8 Implement sign out functionality


  - Create sign out button/handler
  - Clear session and redirect to login
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6.9 Write property test for sign out flow

  - **Property 10: Sign out flow**
  - **Validates: Requirements 4.1, 4.2, 4.3**
-

- [x] 7. Update Server Components for NextAuth




- [x] 7.1 Update dashboard pages to use NextAuth session


  - Replace Supabase session retrieval with NextAuth auth() helper
  - Fetch user profile from Supabase using session user ID
  - _Requirements: 6.1, 6.2_


- [x] 7.2 Write property test for session data completeness

  - **Property 9: Session data completeness**
  - **Validates: Requirements 3.5, 6.2**

- [x] 7.3 Update protected page components


  - Use NextAuth session for authorization checks
  - Handle missing session gracefully
  - _Requirements: 6.3_

- [x] 8. Update API routes for NextAuth




- [x] 8.1 Update existing API routes to use NextAuth


  - Replace Supabase session checks with NextAuth session checks
  - Verify session before processing requests
  - _Requirements: 8.1, 8.2_

- [x] 8.2 Write property test for API route authentication


  - **Property 17: API route authentication**
  - **Validates: Requirements 8.2**


- [x] 8.3 Write property test for API route authorization
  - **Property 18: API route authorization**
  - **Validates: Requirements 8.3**

- [x] 8.4 Ensure RLS policies work with NextAuth sessions


  - Test database queries with authenticated sessions
  - Verify RLS policies enforce access control
  - _Requirements: 8.5, 1.5_


- [x] 8.5 Write property test for RLS policy compatibility

  - **Property 2: RLS policy compatibility**
  - **Validates: Requirements 1.5**

- [x] 8.6 Write property test for API route RLS enforcement

  - **Property 20: API route RLS enforcement**
  - **Validates: Requirements 8.5**

- [x] 9. Implement session validation and error handling





- [x] 9.1 Create session validation utilities


  - Implement session expiration checking
  - Handle invalid sessions
  - _Requirements: 2.5, 3.3, 3.4_

- [x] 9.2 Write property test for session expiration handling


  - **Property 5: Session expiration handling**
  - **Validates: Requirements 2.5**

- [x] 9.3 Write property test for session validation


  - **Property 7: Session validation**
  - **Validates: Requirements 3.3**

- [x] 9.4 Write property test for invalid session handling


  - **Property 8: Invalid session handling**
  - **Validates: Requirements 3.4**

- [x] 9.5 Implement error handling for authentication failures


  - Create error response format
  - Handle disabled accounts
  - Display user-friendly error messages
  - _Requirements: 2.2, 2.3_

- [-] 10. Update Client Components


- [x] 10.1 Update components using session data


  - Replace useSupabaseClient with useSession
  - Update session data access patterns
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10.2 Write property test for client component initial state


  - **Property 15: Client component initial state**
  - **Validates: Requirements 7.3**

- [x] 10.3 Write property test for loading state indication


  - **Property 16: Loading state indication**
  - **Validates: Requirements 7.4**

- [x] 10.4 Update navigation components





  - Show/hide elements based on authentication state
  - Display user information from session
  - _Requirements: 7.1_

- [x] 11. Implement customer signup with lead creation




- [x] 11.1 Create customer signup flow

  - Implement customer registration
  - Automatically create lead record for new customers
  - Link customer account to lead
  - _Requirements: 9.5_




- [ ] 11.2 Write property test for customer lead creation
  - **Property 24: Customer lead creation**
  - **Validates: Requirements 9.5**

- [ ] 12. Testing and validation

- [ ] 12.1 Run all property-based tests
  - Execute all property tests with 100+ iterations
  - Verify all correctness properties hold
  - _Requirements: All_

- [ ] 12.2 Write integration tests for authentication flow
  - Test end-to-end login flow
  - Test end-to-end signup flow
  - Test session management across requests
  - _Requirements: 2.1, 2.2, 9.1, 9.3_

- [ ] 12.3 Write integration tests for protected routes
  - Test middleware protection
  - Test role-based access control
  - Test session validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Remove deprecated Supabase Auth code

- [x] 14.1 Remove old Supabase Auth API routes.





  - Delete `/api/auth/login/route.ts`
  - Remove other Supabase Auth endpoints
  - _Requirements: 10.4_

- [ ] 14.2 Clean up unused Supabase Auth utilities
  - Remove direct Supabase Auth client usage
  - Update imports throughout codebase
  - _Requirements: 10.4_

- [ ] 14.3 Update documentation
  - Document new authentication flow
  - Update README with NextAuth setup instructions
  - Document environment variables
  - _Requirements: 10.5_

- [ ] 15. Final validation and deployment preparation

- [ ] 15.1 Perform security audit
  - Review password hashing implementation
  - Verify session security settings
  - Check for exposed secrets
  - _Requirements: 9.2_

- [ ] 15.2 Performance testing
  - Test authentication performance
  - Verify session management efficiency
  - Check database query performance
  - _Requirements: All_

- [ ] 15.3 Write property test for migration functionality preservation
  - **Property 25: Migration functionality preservation**
  - **Validates: Requirements 10.2**

- [ ] 15.4 Write property test for session preservation during updates
  - **Property 26: Session preservation during updates**
  - **Validates: Requirements 10.3**

- [ ] 16. Final Checkpoint - Make sure all tests are passing

  - Ensure all tests pass, ask the user if questions arise.