# Architecture Clarification: Serverless with Anon Key Only

## Overview

This document clarifies the security architecture of the Solar CRM system to ensure proper implementation.

## Architecture Model

### Fully Serverless Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Vercel)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Client Components (uses anon key + user session)    │   │
│  │  Server Components (uses anon key + user session)    │   │
│  │  API Routes (uses anon key + user session)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Anon Key + User Session
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend (Serverless)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Auth (manages user sessions)               │   │
│  │  PostgreSQL + RLS (enforces all permissions)         │   │
│  │  Supabase Storage + RLS (file access control)        │   │
│  │  RPC Functions (respects RLS)                        │   │
│  │  Edge Functions (can use service role key)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Anon Key Only in Frontend

**All Next.js code uses ONLY the Supabase anon key:**
- ✅ Client Components → anon key + user session
- ✅ Server Components → anon key + user session
- ✅ API Routes → anon key + user session
- ✅ Server Actions → anon key + user session

**The service role key is NEVER used in Next.js:**
- ❌ Never in client-side code
- ❌ Never in server-side code
- ❌ Never in API routes
- ❌ Never in middleware

### 2. Service Role Key Usage

**Service role key is ONLY used in:**
1. **Supabase Edge Functions** - Server-side functions that run on Supabase infrastructure
   - Can bypass RLS when needed for admin operations
   - Not exposed to the browser
   - Example: Generating signed upload URLs, admin overrides

2. **Tests** - For setting up and tearing down test data
   - Used to create test users and data
   - Bypasses RLS for test setup

### 3. Security Enforcement

**All security is enforced at the database level:**

```sql
-- Example: Agent can only see their own leads
CREATE POLICY "Agent own leads" ON leads
  FOR ALL
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );
```

**How it works:**
1. User authenticates with Supabase Auth
2. Supabase issues a JWT token with user ID and metadata
3. Frontend makes requests with anon key + JWT token
4. PostgreSQL RLS policies check `auth.uid()` and user role
5. Database automatically filters results based on RLS policies
6. Frontend cannot bypass these restrictions

### 4. Data Flow Examples

#### Example 1: Agent Viewing Leads

```typescript
// In Next.js (Client or Server Component)
const supabase = createClient() // Uses anon key

// Query leads - RLS automatically filters to agent's leads only
const { data: leads } = await supabase
  .from('leads')
  .select('*')

// Agent only sees their own leads - enforced by RLS
// No need to add .eq('created_by', userId) - RLS does this automatically
```

#### Example 2: Customer Uploading Document

```typescript
// 1. Request signed URL from Edge Function
const { data } = await supabase.functions.invoke('get-upload-url', {
  body: { leadId, documentType }
})

// 2. Upload directly to Supabase Storage
await fetch(data.uploadUrl, {
  method: 'PUT',
  body: file
})

// 3. Record metadata in database
const { error } = await supabase
  .from('documents')
  .insert({
    lead_id: leadId,
    type: documentType,
    file_path: data.filePath
  })

// RLS ensures customer can only upload to their own lead
```

#### Example 3: Admin Override (Edge Function)

```typescript
// In Supabase Edge Function (NOT in Next.js)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Service role key
)

// Can bypass RLS for admin operations
await supabaseAdmin
  .from('leads')
  .update({ status: 'closed' })
  .eq('id', leadId)
```

## Implementation Guidelines

### DO ✅

1. **Use anon key everywhere in Next.js**
   ```typescript
   // lib/supabase/client.ts
   export const createClient = () => {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anon key
     )
   }
   ```

2. **Trust RLS policies for authorization**
   ```typescript
   // No need to manually filter by user
   const { data } = await supabase.from('leads').select('*')
   // RLS automatically filters based on user role
   ```

3. **Use Edge Functions for operations that need service role**
   ```typescript
   // For admin overrides, signed URLs, etc.
   const { data } = await supabase.functions.invoke('admin-operation', {
     body: { action: 'override' }
   })
   ```

### DON'T ❌

1. **Never use service role key in Next.js**
   ```typescript
   // ❌ WRONG - Never do this
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY // Never in frontend!
   )
   ```

2. **Don't try to bypass RLS in application code**
   ```typescript
   // ❌ WRONG - Don't manually implement authorization
   if (user.role === 'agent') {
     query = query.eq('created_by', user.id)
   }
   // ✅ RIGHT - Let RLS handle it automatically
   ```

3. **Don't expose service role key in environment variables accessible to frontend**
   ```env
   # ❌ WRONG - Never in .env.local or NEXT_PUBLIC_*
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=xxx
   
   # ✅ RIGHT - Only these in frontend
   NEXT_PUBLIC_SUPABASE_URL=xxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

## Benefits of This Architecture

1. **Security**: Impossible for frontend to bypass RLS policies
2. **Simplicity**: No need to implement authorization logic in application code
3. **Consistency**: Same security rules apply everywhere
4. **Auditability**: All access control defined in one place (RLS policies)
5. **Performance**: Database-level filtering is highly optimized
6. **Scalability**: Fully serverless, no servers to manage

## Testing Considerations

Tests need service role key to set up test data:

```typescript
// In tests only
const serviceClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // OK in tests
)

// Set up test data
await serviceClient.from('users').insert(testUser)
await serviceClient.from('leads').insert(testLeads)

// Then test with anon key
const userClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
// Test that RLS works correctly
```

## Summary

- **Frontend (Next.js)**: Anon key only, all code respects RLS
- **Backend (Supabase)**: RLS enforces all permissions
- **Edge Functions**: Can use service role key when needed
- **Tests**: Use service role key for setup only
- **Security**: Database-enforced, cannot be bypassed by frontend

This architecture ensures maximum security while maintaining simplicity and scalability.
