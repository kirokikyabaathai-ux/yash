# RLS Policy Tests

This directory contains property-based tests for Row-Level Security (RLS) policies.

## Prerequisites

Before running these tests, you need to:

1. **Install testing dependencies** (covered in task 8):
   ```bash
   npm install --save-dev jest @types/jest ts-jest
   npm install --save-dev fast-check
   npm install --save-dev @supabase/supabase-js
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   ```

2. **Configure Jest** - Create `jest.config.js`:
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/__tests__'],
     testMatch: ['**/*.test.ts'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   ```

3. **Set up environment variables** - Create `.env.test`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Apply RLS policies to Supabase**:
   ```bash
   # Apply the RLS policies from supabase/config/
   psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-leads.sql
   psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-documents.sql
   psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-step-master.sql
   psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-other.sql
   ```

   Or use Supabase CLI:
   ```bash
   supabase db push
   ```

## Running Tests

Once the prerequisites are complete:

```bash
# Run all tests
npm test

# Run RLS policy tests specifically
npm test rls-policies

# Run with coverage
npm test -- --coverage
```

## Test Structure

The RLS policy tests validate the following properties:

- **Property 34**: Agent RLS Lead Filtering (Requirement 8.1)
- **Property 35**: Customer RLS Lead Filtering (Requirement 8.2)
- **Property 36**: Office and Admin RLS Full Access (Requirement 8.3)
- **Property 37**: Installer RLS Lead Filtering (Requirement 8.4)
- **Property 38**: Step Master RLS Admin-Only Modification (Requirement 8.5)

Each property test runs 100 iterations with randomly generated data using fast-check.

## Important Notes

- These tests require a live Supabase instance with RLS policies applied
- Tests use the service role key to set up test data and clean up after each test
- Each test creates temporary users and leads, then cleans them up
- Tests are isolated and can run in parallel
