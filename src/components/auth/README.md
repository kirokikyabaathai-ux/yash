# Authentication Module

This module implements user authentication and account management for the Solar CRM system.

## Components

### AuthProvider
Context provider that manages authentication state throughout the application.

**Features:**
- Tracks current user and profile
- Listens for auth state changes
- Provides sign out functionality
- Automatically fetches user profile on login

**Usage:**
```tsx
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';

// Wrap your app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use the hook in components
const { user, profile, loading, signOut } = useAuth();
```

### LoginForm
Form component for user authentication.

**Features:**
- Email/password authentication
- Error handling and display
- Disabled account detection
- Role-based dashboard redirection
- Link to signup page

**Supported Roles:**
- Admin → `/admin/dashboard`
- Office → `/office/dashboard`
- Agent → `/agent/dashboard`
- Installer → `/installer/dashboard`
- Customer → `/customer/dashboard`

### SignupForm
Form component for customer self-registration.

**Features:**
- Creates Supabase Auth account
- Creates user profile with 'customer' role
- Automatically links to existing lead by phone number
- Creates new lead if no match found
- Form validation (password length, phone format)

**Registration Flow:**
1. User fills out form (name, email, phone, password)
2. System creates Supabase Auth account
3. System creates user profile in database
4. System calls `link_customer_to_lead` RPC function
5. User is redirected to customer dashboard

## API Routes

### POST /api/auth/login
Authenticates a user and returns session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "profile": { ... },
  "session": { ... }
}
```

**Error Codes:**
- `MISSING_FIELDS` (400): Email or password missing
- `AUTH_FAILED` (401): Invalid credentials
- `ACCOUNT_DISABLED` (403): Account is disabled
- `PROFILE_ERROR` (500): Failed to fetch profile

### POST /api/auth/signup
Creates a new customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "profile": { ... },
  "session": { ... }
}
```

**Error Codes:**
- `MISSING_FIELDS` (400): Required fields missing
- `INVALID_PASSWORD` (400): Password too short
- `INVALID_PHONE` (400): Invalid phone number
- `SIGNUP_FAILED` (400): Account creation failed
- `PROFILE_ERROR` (500): Profile creation failed

### POST /api/auth/logout
Signs out the current user.

**Response:**
```json
{
  "success": true
}
```

## Middleware

The authentication middleware (`middleware.ts`) handles:
- Session refresh on each request
- Route protection based on authentication status
- Role-based access control
- Automatic redirection to appropriate dashboards
- Disabled account detection

**Protected Routes:**
- `/admin/*` - Admin only
- `/office/*` - Office and Admin
- `/agent/*` - Agent and Admin
- `/installer/*` - Installer and Admin
- `/customer/*` - Customer and Admin

**Public Routes:**
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/auth/callback` - OAuth callback

## Property-Based Tests

The authentication module includes comprehensive property-based tests using fast-check.

**Properties Tested:**
1. **Authentication Session Creation** - Valid credentials create session with token
2. **Role Assignment Uniqueness** - Each user has exactly one role
3. **Role-Based Dashboard Routing** - Users redirect to correct dashboard
4. **Disabled Account Authentication Block** - Disabled accounts cannot authenticate
5. **User Profile Data Persistence** - All profile fields are persisted

**Running Tests:**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run tests
npm test -- __tests__/auth-properties.test.ts
```

**Note:** Tests require a Supabase project with the solar-crm schema deployed.

## Security Model

**Important Security Notes:**
- All Next.js code (frontend and server-side) uses ONLY the Supabase anon key
- Service role key is NEVER used in the Next.js application
- Service role key is ONLY used in:
  1. Supabase Edge Functions (server-side, not exposed to browser)
  2. Tests (for setup/teardown)
- All permissions are enforced by RLS policies at the database level
- The frontend cannot bypass RLS policies - security is database-enforced

**Authentication Flow:**
1. User submits credentials
2. Supabase Auth validates credentials
3. Session token is created and stored in cookies
4. User profile is fetched from database (RLS applies)
5. User is redirected based on role
6. All subsequent requests include session token
7. RLS policies filter data based on authenticated user

## Environment Variables

Required environment variables:

```env
# Public variables (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only variables (for tests only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Error Handling

All authentication errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}
```

Common error scenarios:
- Invalid credentials → 401 Unauthorized
- Disabled account → 403 Forbidden
- Missing fields → 400 Bad Request
- Server errors → 500 Internal Server Error

## Future Enhancements

Potential improvements:
- OAuth providers (Google, GitHub)
- Two-factor authentication
- Password reset flow
- Email verification
- Session management (view active sessions, revoke sessions)
- Account lockout after failed attempts
