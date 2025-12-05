# Design Document: NextAuth Integration with Supabase

## Overview

This document outlines the technical design for integrating NextAuth (Auth.js v5) into the YAS Natural Solar CRM application while maintaining compatibility with the existing Supabase infrastructure. The integration will replace direct Supabase Auth calls with NextAuth's authentication layer, while continuing to use Supabase for data storage, RLS policies, and user management.

### Goals

- Implement NextAuth as the primary authentication layer
- Maintain backward compatibility with existing Supabase database schema
- Preserve Row Level Security (RLS) policies
- Support credentials-based authentication (email/password)
- Enable future expansion to OAuth providers
- Provide seamless session management across client and server
- Minimize disruption to existing application functionality

### Non-Goals

- Migrating away from Supabase database
- Changing existing RLS policies
- Modifying user data schema
- Implementing OAuth providers (future enhancement)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Client     │         │   Server     │                  │
│  │  Components  │◄────────┤  Components  │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│  ┌──────▼────────────────────────▼───────┐                  │
│  │         NextAuth Session               │                  │
│  │      (Cookie-based storage)            │                  │
│  └──────┬────────────────────────┬────────┘                  │
│         │                        │                           │
│  ┌──────▼───────┐         ┌──────▼───────┐                  │
│  │  useSession  │         │  auth()      │                  │
│  │    Hook      │         │  Helper      │                  │
│  └──────────────┘         └──────────────┘                  │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
      
                          │
                    ┌───────────▼────────────┐
                    │      NextAuth Core     │
                    │  - Session Management  │
                    │  - JWT Handling        │
                    │  - Credentials Provider│
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Supabase Database    │
                    │  - users table         │
                    │  - RLS Policies        │
                    │  - Application Data    │
                    └────────────────────────┘
```

### Authentication Flow

1. **Login Flow:**
   - User submits credentials via LoginForm
   - NextAuth Credentials Provider validates against Supabase users table
   - Password verified using bcrypt
   - Session created and stored in HTTP-only cookie
   - User redirected to role-appropriate dashboard

2. **Session Management:**
   - NextAuth manages session lifecycle
   - JWT tokens stored in HTTP-only cookies
   - Automatic token refresh before expiration
   - Session data includes user ID, email, role, and status

3. **Authorization:**
   - Middleware checks session validity
   - Role-based access control enforced
   - Disabled accounts prevented from accessing protected routes

## Components and Interfaces

### NextAuth Configuration

**File:** `src/lib/auth/config.ts`

```typescript
interface AuthConfig {
  providers: Provider[]
  adapter: Adapter
  session: SessionStrategy
  callbacks: AuthCallbacks
  pages: AuthPages
}
```

### Credentials Provider

Handles email/password authentication:

```typescript
interface CredentialsConfig {
  name: string
  credentials: {
    email: { label: string; type: string }
    password: { label: string; type: string }
  }
  authorize: (credentials) => Promise<User | null>
}
```

### Session Interface

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    status: UserStatus
  }
  expires: string
}
```

### Auth Callbacks

```typescript
interface AuthCallbacks {
  jwt: (params: JWTParams) => Promise<JWT>
  session: (params: SessionParams) => Promise<Session>
}
```

## Data Models

### Existing Supabase Schema (Unchanged)

The `users` table remains unchanged:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'office', 'installer', 'customer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  agent_id UUID REFERENCES users(id),
  office_id UUID REFERENCES users(id),
  customer_id TEXT,
  assigned_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Password Storage

Passwords will be stored in Supabase Auth's `auth.users` table, which NextAuth will query during authentication. The existing Supabase Auth infrastructure handles password hashing with bcrypt.

### Session Token Structure

```typescript
interface JWT {
  sub: string          // User ID
  email: string
  name: string
  role: UserRole
  status: UserStatus
  iat: number         // Issued at
  exp: number         // Expiration
  jti: string         // JWT ID
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN NextAuth is configured THEN the system SHALL use Supabase as the database adapter for session storage
Thoughts: This is about system configuration. We can verify that the NextAuth configuration object includes the Supabase adapter and that sessions are being stored in the expected location.
Testable: yes - example

1.2 WHEN a user authenticates THEN the system SHALL store session data in Supabase tables
Thoughts: This is a rule that should apply to all authentication attempts. We can test that for any valid authentication, session data appears in the database.
Testable: yes - property

1.3 WHEN the application starts THEN the system SHALL initialize NextAuth with credentials provider support
Thoughts: This is about initialization. We can check that the credentials provider is present in the configuration.
Testable: yes - example

1.4 WHERE the existing Supabase database is used THEN the system SHALL create necessary NextAuth tables without breaking existing functionality
Thoughts: This is about database migration safety. We can test that after setup, all existing queries still work.
Testable: yes - property

1.5 WHEN NextAuth handles authentication THEN the system SHALL maintain compatibility with existing RLS policies
Thoughts: This is critical - RLS policies must continue to work. We can test that authenticated requests still respect RLS.
Testable: yes - property

2.1 WHEN a user submits valid credentials THEN the system SHALL authenticate the user and create a session
Thoughts: This is a core authentication property that should hold for all valid credentials.
Testable: yes - property

2.2 WHEN a user submits invalid credentials THEN the system SHALL reject authentication and display an appropriate error message
Thoughts: This should hold for all invalid credential combinations.
Testable: yes - property

2.3 WHEN a user's account is disabled THEN the system SHALL prevent authentication and display a disabled account message
Thoughts: This is an edge case but important. We should test that disabled accounts cannot authenticate.
Testable: edge-case

2.4 WHEN authentication succeeds THEN the system SHALL redirect the user to their role-appropriate dashboard
Thoughts: This is a property about all successful authentications - each role should go to the correct dashboard.
Testable: yes - property

2.5 WHEN a user session expires THEN the system SHALL require re-authentication
Thoughts: This is about session lifecycle. We can test that expired sessions are rejected.
Testable: yes - property

3.1 WHEN a user has an active session THEN the system SHALL maintain that session across page refreshes
Thoughts: This is a property about session persistence that should hold for all active sessions.
Testable: yes - property

3.2 WHEN a user closes and reopens the browser THEN the system SHALL restore the session if it has not expired
Thoughts: This is about session restoration. We can test that valid sessions persist across browser restarts.
Testable: yes - property

3.3 WHEN a session is restored THEN the system SHALL validate the session against the database
Thoughts: This is a security property - all restored sessions must be validated.
Testable: yes - property

3.4 WHEN a session is invalid THEN the system SHALL clear the session and redirect to login
Thoughts: This should hold for all invalid sessions.
Testable: yes - property

3.5 WHEN session data is accessed THEN the system SHALL provide user profile information including role
Thoughts: This is about data completeness in sessions.
Testable: yes - property

4.1 WHEN a user initiates sign out THEN the system SHALL invalidate the session in the database
Thoughts: This is a property about all sign out operations.
Testable: yes - property

4.2 WHEN sign out completes THEN the system SHALL clear all session cookies
Thoughts: This should hold for all sign out operations.
Testable: yes - property

4.3 WHEN sign out completes THEN the system SHALL redirect the user to the login page
Thoughts: This is about the sign out flow.
Testable: yes - property

4.4 WHEN a signed-out user attempts to access protected routes THEN the system SHALL redirect to login
Thoughts: This is a security property that should hold for all protected routes.
Testable: yes - property

5.1 WHEN an unauthenticated user accesses a protected route THEN the system SHALL redirect to the login page
Thoughts: This is a core security property that must hold for all protected routes.
Testable: yes - property

5.2 WHEN an authenticated user accesses a protected route THEN the system SHALL allow access
Thoughts: This is the inverse of 5.1 and should hold for all authenticated users.
Testable: yes - property

5.3 WHEN middleware checks authentication THEN the system SHALL verify the session exists and is valid
Thoughts: This is about middleware behavior for all requests.
Testable: yes - property

5.4 WHEN a user lacks permission for a route THEN the system SHALL redirect to an appropriate page
Thoughts: This is about authorization for all role-restricted routes.
Testable: yes - property

5.5 WHERE role-based access is required THEN the system SHALL enforce role restrictions at the middleware level
Thoughts: This is about role enforcement across all protected routes.
Testable: yes - property

6.1 WHEN a Server Component needs session data THEN the system SHALL provide a method to retrieve the current session
Thoughts: This is about API availability in server components.
Testable: yes - example

6.2 WHEN session data is retrieved THEN the system SHALL include user ID, email, and role information
Thoughts: This is about data completeness for all session retrievals.
Testable: yes - property

6.3 WHEN no session exists THEN the system SHALL return null without throwing errors
Thoughts: This is about error handling for the no-session case.
Testable: yes - example

6.4 WHEN session data is accessed THEN the system SHALL not cause unnecessary re-renders
Thoughts: This is about performance, which is harder to test deterministically.
Testable: no

6.5 WHEN session data includes user profile THEN the system SHALL fetch it from the users table
Thoughts: This is about data source for all profile fetches.
Testable: yes - property

7.1 WHEN a Client Component needs session data THEN the system SHALL provide a React hook to access the session
Thoughts: This is about API availability.
Testable: yes - example

7.2 WHEN the session changes THEN the system SHALL update Client Components reactively
Thoughts: This is about reactivity for all session changes.
Testable: yes - property

7.3 WHEN a Client Component mounts THEN the system SHALL provide the current session state
Thoughts: This is about initial state for all component mounts.
Testable: yes - property

7.4 WHEN session loading is in progress THEN the system SHALL indicate loading state
Thoughts: This is about loading state for all session fetches.
Testable: yes - property

7.5 WHEN session data is accessed in Client Components THEN the system SHALL maintain type safety
Thoughts: This is about TypeScript types, which is a compile-time property.
Testable: no

8.1 WHEN an API route requires authentication THEN the system SHALL provide a method to verify the session
Thoughts: This is about API availability for all API routes.
Testable: yes - example

8.2 WHEN an authenticated request is made THEN the system SHALL include session information in the request context
Thoughts: This should hold for all authenticated API requests.
Testable: yes - property

8.3 WHEN an unauthenticated request is made to a protected endpoint THEN the system SHALL return a 401 status
Thoughts: This is a security property for all protected endpoints.
Testable: yes - property

8.4 WHEN API routes access user data THEN the system SHALL use the authenticated user's ID
Thoughts: This is about data access for all API routes.
Testable: yes - property

8.5 WHEN API routes interact with Supabase THEN the system SHALL maintain RLS policy enforcement
Thoughts: This is critical for security across all API routes.
Testable: yes - property

9.1 WHEN a new user signs up THEN the system SHALL create a user record in the users table
Thoughts: This should hold for all signup operations.
Testable: yes - property

9.2 WHEN a user is created THEN the system SHALL hash the password securely
Thoughts: This is a security property for all user creation.
Testable: yes - property

9.3 WHEN signup completes THEN the system SHALL automatically authenticate the new user
Thoughts: This is about the signup flow for all new users.
Testable: yes - property

9.4 WHEN a user signs up with an existing email THEN the system SHALL reject the signup with an appropriate error
Thoughts: This is an error case that should hold for all duplicate emails.
Testable: yes - property

9.5 WHEN a customer signs up THEN the system SHALL automatically create an associated lead record
Thoughts: This is business logic that should hold for all customer signups.
Testable: yes - property

10.1 WHEN NextAuth is integrated THEN the system SHALL allow both old and new auth patterns to coexist temporarily
Thoughts: This is about migration strategy. Hard to test as a property since it's temporary.
Testable: no

10.2 WHEN migration is in progress THEN the system SHALL maintain all existing functionality
Thoughts: This is about regression testing during migration.
Testable: yes - property

10.3 WHEN authentication flows are updated THEN the system SHALL preserve user sessions
Thoughts: This is about session continuity during updates.
Testable: yes - property

10.4 WHEN the migration is complete THEN the system SHALL remove deprecated Supabase Auth code
Thoughts: This is a one-time cleanup task.
Testable: no

10.5 WHEN errors occur during migration THEN the system SHALL provide clear error messages for debugging
Thoughts: This is about error handling quality, which is subjective.
Testable: no

### Property Reflection

After reviewing all properties, the following consolidations can be made:

- Properties 5.1 and 5.2 are complementary and can be combined into a single property about route protection
- Properties 4.1, 4.2, and 4.3 describe the sign-out flow and can be combined
- Properties 3.1 and 3.2 both test session persistence and can be combined
- Properties 2.1 and 2.4 both test successful authentication flow and can be combined

### Correctness Properties

Property 1: Session storage in Supabase
*For any* authenticated user, when authentication succeeds, session data should be stored in the Supabase database
**Validates: Requirements 1.2**

Property 2: RLS policy compatibility
*For any* database query made with an authenticated session, the existing RLS policies should continue to enforce access control correctly
**Validates: Requirements 1.5**

Property 3: Valid credentials authentication
*For any* valid email and password combination, the system should create a session and redirect to the role-appropriate dashboard
**Validates: Requirements 2.1, 2.4**

Property 4: Invalid credentials rejection
*For any* invalid email or password, the system should reject authentication and return an appropriate error message
**Validates: Requirements 2.2**

Property 5: Session expiration handling
*For any* expired session, the system should require re-authentication
**Validates: Requirements 2.5**

Property 6: Session persistence
*For any* active session, the session should persist across page refreshes and browser restarts until expiration
**Validates: Requirements 3.1, 3.2**

Property 7: Session validation
*For any* session restoration attempt, the system should validate the session against the database before granting access
**Validates: Requirements 3.3**

Property 8: Invalid session handling
*For any* invalid session, the system should clear the session and redirect to login
**Validates: Requirements 3.4**

Property 9: Session data completeness
*For any* session access, the system should provide complete user profile information including role
**Validates: Requirements 3.5, 6.2**

Property 10: Sign out flow
*For any* sign out operation, the system should invalidate the database session, clear cookies, and redirect to login
**Validates: Requirements 4.1, 4.2, 4.3**

Property 11: Protected route access control
*For any* protected route, unauthenticated users should be redirected to login and authenticated users should be granted access
**Validates: Requirements 5.1, 5.2, 4.4**

Property 12: Middleware session verification
*For any* request to a protected route, middleware should verify the session exists and is valid
**Validates: Requirements 5.3**

Property 13: Role-based authorization
*For any* role-restricted route, users without the required role should be redirected to an appropriate page
**Validates: Requirements 5.4, 5.5**

Property 14: Client component reactivity
*For any* session change, all Client Components using the session should update reactively
**Validates: Requirements 7.2**

Property 15: Client component initial state
*For any* Client Component mount, the component should receive the current session state
**Validates: Requirements 7.3**

Property 16: Loading state indication
*For any* session fetch in progress, the system should indicate loading state
**Validates: Requirements 7.4**

Property 17: API route authentication
*For any* authenticated API request, the system should include session information in the request context
**Validates: Requirements 8.2**

Property 18: API route authorization
*For any* unauthenticated request to a protected API endpoint, the system should return a 401 status
**Validates: Requirements 8.3**

Property 19: API route user context
*For any* API route accessing user data, the system should use the authenticated user's ID
**Validates: Requirements 8.4**

Property 20: API route RLS enforcement
*For any* API route interacting with Supabase, RLS policies should be enforced
**Validates: Requirements 8.5**

Property 21: User creation
*For any* signup operation, the system should create a user record in the users table with a securely hashed password
**Validates: Requirements 9.1, 9.2**

Property 22: Post-signup authentication
*For any* successful signup, the system should automatically authenticate the new user
**Validates: Requirements 9.3**

Property 23: Duplicate email rejection
*For any* signup attempt with an existing email, the system should reject the signup with an appropriate error
**Validates: Requirements 9.4**

Property 24: Customer lead creation
*For any* customer signup, the system should automatically create an associated lead record
**Validates: Requirements 9.5**

Property 25: Migration functionality preservation
*For any* existing feature, functionality should remain unchanged during and after migration
**Validates: Requirements 10.2**

Property 26: Session preservation during updates
*For any* authentication flow update, existing user sessions should be preserved
**Validates: Requirements 10.3**

## Error Handling

### Authentication Errors

```typescript
enum AuthError {
  INVALID_CREDENTIALS = 'Invalid email or password',
  ACCOUNT_DISABLED = 'Your account has been disabled',
  SESSION_EXPIRED = 'Your session has expired',
  UNAUTHORIZED = 'You are not authorized to access this resource',
  NETWORK_ERROR = 'Network error occurred',
  UNKNOWN_ERROR = 'An unexpected error occurred'
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
}
```

### Error Handling Strategy

1. **Client-side errors:** Display user-friendly messages in the UI
2. **Server-side errors:** Log detailed error information, return sanitized messages to client
3. **Session errors:** Automatically redirect to login with appropriate error message
4. **Network errors:** Implement retry logic with exponential backoff

## Testing Strategy

### Unit Testing

Unit tests will verify individual functions and components:

- Auth configuration setup
- Credential validation logic
- Session token generation
- Password hashing and verification
- Error handling functions
- Utility functions for role checking

### Property-Based Testing

Property-based tests will use **fast-check** library to verify correctness properties across many inputs:

- Session persistence across various user states
- Role-based access control for all role combinations
- Authentication flow for various credential inputs
- Session validation for various token states
- RLS policy enforcement for various user contexts

**Configuration:** Each property test will run a minimum of 100 iterations to ensure comprehensive coverage.

**Tagging:** Each property-based test will include a comment with the format:
```typescript
// Feature: nextauth-integration, Property X: [property description]
// Validates: Requirements X.Y
```

### Integration Testing

Integration tests will verify the interaction between NextAuth and Supabase:

- End-to-end authentication flow
- Session management across client and server
- Database queries with RLS enforcement
- Middleware protection of routes
- API route authentication

### Example Property-Based Test Structure

```typescript
import fc from 'fast-check';

// Feature: nextauth-integration, Property 3: Valid credentials authentication
// Validates: Requirements 2.1, 2.4
describe('Authentication Properties', () => {
  it('should authenticate valid credentials and redirect appropriately', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          role: fc.constantFrom('admin', 'agent', 'office', 'installer', 'customer')
        }),
        async (user) => {
          // Create user in database
          await createTestUser(user);
          
          // Attempt authentication
          const result = await signIn('credentials', {
            email: user.email,
            password: user.password,
            redirect: false
          });
          
          // Verify session created
          expect(result.ok).toBe(true);
          
          // Verify redirect URL matches role
          const expectedDashboard = getDashboardRoute(user.role);
          expect(result.url).toContain(expectedDashboard);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Migration Strategy

### Phase 1: Setup (No Breaking Changes)

1. Install NextAuth and dependencies
2. Create NextAuth configuration
3. Set up API routes for NextAuth
4. Configure environment variables
5. Run tests to ensure no regressions

### Phase 2: Parallel Implementation

1. Implement NextAuth authentication alongside existing Supabase Auth
2. Create new login/signup components using NextAuth
3. Add feature flag to switch between auth systems
4. Test both systems in parallel

### Phase 3: Migration

1. Update middleware to use NextAuth sessions
2. Update protected routes to use NextAuth
3. Update API routes to use NextAuth
4. Migrate existing user sessions
5. Update client components to use NextAuth hooks

### Phase 4: Cleanup

1. Remove Supabase Auth code
2. Remove feature flags
3. Update documentation
4. Final testing and validation

### Rollback Plan

If issues arise during migration:

1. Revert to previous version using Git
2. Re-enable Supabase Auth via feature flag
3. Investigate and fix issues
4. Retry migration after fixes

## Security Considerations

### Password Security

- Passwords hashed using bcrypt with salt rounds >= 10
- Password requirements: minimum 8 characters
- No password stored in plain text anywhere

### Session Security

- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- SameSite=Lax prevents CSRF attacks
- Short session expiration (7 days default)
- Automatic token refresh before expiration

### API Security

- All API routes verify session before processing
- RLS policies enforce data access control
- Rate limiting on authentication endpoints
- CORS properly configured

### Environment Variables

- Sensitive keys stored in environment variables
- Never committed to version control
- Different keys for development and production
- Regular key rotation policy

## Performance Considerations

### Session Management

- JWT tokens minimize database queries
- Session data cached in memory on server
- Efficient cookie parsing in middleware

### Database Queries

- Indexed columns for user lookups
- Connection pooling for Supabase client
- Prepared statements for common queries

### Client-Side Performance

- Session data fetched once per page load
- React Context prevents prop drilling
- Memoization of session-dependent computations

## Deployment Considerations

### Environment Setup

Required environment variables:
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Migrations

No database schema changes required. Existing Supabase Auth tables will be used.

### Monitoring

- Log authentication attempts (success/failure)
- Monitor session creation/expiration rates
- Track authentication errors
- Alert on unusual patterns

## Future Enhancements

### OAuth Providers

NextAuth makes it easy to add OAuth providers:
- Google OAuth
- GitHub OAuth
- Microsoft OAuth
- Custom OAuth providers

### Multi-Factor Authentication

- TOTP-based 2FA
- SMS-based 2FA
- Email-based 2FA

### Advanced Session Management

- Device management
- Session revocation
- Concurrent session limits

### Audit Logging

- Detailed authentication audit trail
- Session activity logging
- Security event notifications