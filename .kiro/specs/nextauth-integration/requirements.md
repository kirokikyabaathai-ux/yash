# Requirements Document

## Introduction

This document outlines the requirements for integrating NextAuth (Auth.js v5) into the YAS Natural Solar CRM application. The system currently uses Supabase Auth directly for authentication. The integration will replace the direct Supabase Auth implementation with NextAuth while maintaining compatibility with the existing Supabase database and user management system. This will provide a more flexible authentication layer that can support multiple providers and better session management.

## Glossary

- **NextAuth**: An authentication library for Next.js applications (also known as Auth.js v5)
- **Supabase Auth**: The authentication service provided by Supabase
- **Session**: An authenticated user's active connection to the application
- **Provider**: An authentication method (e.g., credentials, OAuth)
- **Middleware**: Next.js middleware that runs before requests are processed
- **RLS**: Row Level Security policies in Supabase that control data access
- **User Profile**: Extended user information stored in the users table
- **Role**: User type (admin, agent, office, installer, customer)

## Requirements

### Requirement 1

**User Story:** As a developer, I want to integrate NextAuth with the existing Supabase infrastructure, so that I can maintain backward compatibility while gaining NextAuth's features.

#### Acceptance Criteria

1. WHEN NextAuth is configured THEN the system SHALL use Supabase as the database adapter for session storage
2. WHEN a user authenticates THEN the system SHALL store session data in Supabase tables
3. WHEN the application starts THEN the system SHALL initialize NextAuth with credentials provider support
4. WHERE the existing Supabase database is used THEN the system SHALL create necessary NextAuth tables without breaking existing functionality
5. WHEN NextAuth handles authentication THEN the system SHALL maintain compatibility with existing RLS policies

### Requirement 2

**User Story:** As a user, I want to sign in with my email and password, so that I can access my account securely.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN the system SHALL authenticate the user and create a session
2. WHEN a user submits invalid credentials THEN the system SHALL reject authentication and display an appropriate error message
3. WHEN a user's account is disabled THEN the system SHALL prevent authentication and display a disabled account message
4. WHEN authentication succeeds THEN the system SHALL redirect the user to their role-appropriate dashboard
5. WHEN a user session expires THEN the system SHALL require re-authentication

### Requirement 3

**User Story:** As a user, I want my session to persist across page refreshes, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a user has an active session THEN the system SHALL maintain that session across page refreshes
2. WHEN a user closes and reopens the browser THEN the system SHALL restore the session if it has not expired
3. WHEN a session is restored THEN the system SHALL validate the session against the database
4. WHEN a session is invalid THEN the system SHALL clear the session and redirect to login
5. WHEN session data is accessed THEN the system SHALL provide user profile information including role

### Requirement 4

**User Story:** As a user, I want to sign out of my account, so that I can end my session securely.

#### Acceptance Criteria

1. WHEN a user initiates sign out THEN the system SHALL invalidate the session in the database
2. WHEN sign out completes THEN the system SHALL clear all session cookies
3. WHEN sign out completes THEN the system SHALL redirect the user to the login page
4. WHEN a signed-out user attempts to access protected routes THEN the system SHALL redirect to login

### Requirement 5

**User Story:** As a developer, I want protected routes to require authentication, so that unauthorized users cannot access sensitive areas.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses a protected route THEN the system SHALL redirect to the login page
2. WHEN an authenticated user accesses a protected route THEN the system SHALL allow access
3. WHEN middleware checks authentication THEN the system SHALL verify the session exists and is valid
4. WHEN a user lacks permission for a route THEN the system SHALL redirect to an appropriate page
5. WHERE role-based access is required THEN the system SHALL enforce role restrictions at the middleware level

### Requirement 6

**User Story:** As a developer, I want to access session data in Server Components, so that I can render user-specific content.

#### Acceptance Criteria

1. WHEN a Server Component needs session data THEN the system SHALL provide a method to retrieve the current session
2. WHEN session data is retrieved THEN the system SHALL include user ID, email, and role information
3. WHEN no session exists THEN the system SHALL return null without throwing errors
4. WHEN session data is accessed THEN the system SHALL not cause unnecessary re-renders
5. WHEN session data includes user profile THEN the system SHALL fetch it from the users table

### Requirement 7

**User Story:** As a developer, I want to access session data in Client Components, so that I can build interactive user interfaces.

#### Acceptance Criteria

1. WHEN a Client Component needs session data THEN the system SHALL provide a React hook to access the session
2. WHEN the session changes THEN the system SHALL update Client Components reactively
3. WHEN a Client Component mounts THEN the system SHALL provide the current session state
4. WHEN session loading is in progress THEN the system SHALL indicate loading state
5. WHEN session data is accessed in Client Components THEN the system SHALL maintain type safety

### Requirement 8

**User Story:** As a developer, I want to maintain existing API route authentication, so that backend endpoints remain secure.

#### Acceptance Criteria

1. WHEN an API route requires authentication THEN the system SHALL provide a method to verify the session
2. WHEN an authenticated request is made THEN the system SHALL include session information in the request context
3. WHEN an unauthenticated request is made to a protected endpoint THEN the system SHALL return a 401 status
4. WHEN API routes access user data THEN the system SHALL use the authenticated user's ID
5. WHEN API routes interact with Supabase THEN the system SHALL maintain RLS policy enforcement

### Requirement 9

**User Story:** As a system administrator, I want user signup to work with NextAuth, so that new users can create accounts.

#### Acceptance Criteria

1. WHEN a new user signs up THEN the system SHALL create a user record in the users table
2. WHEN a user is created THEN the system SHALL hash the password securely
3. WHEN signup completes THEN the system SHALL automatically authenticate the new user
4. WHEN a user signs up with an existing email THEN the system SHALL reject the signup with an appropriate error
5. WHEN a customer signs up THEN the system SHALL automatically create an associated lead record

### Requirement 10

**User Story:** As a developer, I want to migrate existing authentication code gradually, so that I can minimize disruption to the application.

#### Acceptance Criteria

1. WHEN NextAuth is integrated THEN the system SHALL allow both old and new auth patterns to coexist temporarily
2. WHEN migration is in progress THEN the system SHALL maintain all existing functionality
3. WHEN authentication flows are updated THEN the system SHALL preserve user sessions
4. WHEN the migration is complete THEN the system SHALL remove deprecated Supabase Auth code
5. WHEN errors occur during migration THEN the system SHALL provide clear error messages for debugging
