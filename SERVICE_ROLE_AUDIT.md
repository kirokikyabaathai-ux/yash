# Service Role Key Audit Report

## Summary
Audit of the codebase to identify operations that require Supabase service role key and will fail in production when using only the anon key.

## Issues Found & Fixed

### ✅ FIXED: User Deletion (Critical)

**Location:** `src/app/api/users/[id]/route.ts` - DELETE endpoint

**Problem:**
- Used `supabase.auth.admin.deleteUser()` directly in API route
- This requires service role key which won't be available in production
- Would fail with permission error when admins try to delete users

**Solution:**
- Created new edge function: `supabase/edge-functions/delete-user/index.ts`
- Edge function has access to service role key via environment variables
- Updated API route to call the edge function instead
- Added self-deletion prevention
- Proper error handling and rollback logic

**Files Modified:**
- ✅ Created: `supabase/edge-functions/delete-user/index.ts`
- ✅ Updated: `src/app/api/users/[id]/route.ts`

## Operations That Work Fine (No Service Role Needed)

### ✅ Storage Operations
**Locations:**
- `src/app/api/documents/[id]/view/route.ts` - `createSignedUrl()`
- `src/app/api/leads/[id]/documents/upload-url/route.ts` - `createSignedUploadUrl()`

**Why they work:**
- These methods respect RLS policies
- Work with anon key + user JWT
- RLS policies control access, not the key type

### ✅ Database Queries
**All queries in `src/` directory:**
- All `.from()` queries respect RLS policies
- Work with anon key + authenticated user context
- RLS policies provide security

### ✅ User Creation
**Location:** `src/app/api/users/route.ts` - POST endpoint

**Already correct:**
- Calls `create-user` edge function
- Edge function handles `auth.admin.createUser()`
- No changes needed

## Edge Functions (Require Service Role)

All edge functions properly use service role key via environment variables:

1. ✅ `create-user` - Creates auth users and profiles
2. ✅ `delete-user` - Deletes auth users and profiles (NEW)
3. ✅ `get-upload-url` - Generates signed upload URLs
4. ✅ `document-validation` - Validates documents and updates lead status
5. ✅ `activity-logger` - Logs system activities

## Test Files

All test files in `__tests__/` use service role key for:
- Creating test users
- Deleting test users
- Setting up test data
- Bypassing RLS for assertions

**Note:** Tests are not deployed to production, so this is acceptable.

## Deployment Checklist

### Environment Variables Required

**Production (Vercel/Netlify/etc.):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Edge Functions (Supabase):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Tests (Local/CI):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Edge Functions to Deploy

```bash
# Deploy all edge functions
supabase functions deploy create-user
supabase functions deploy delete-user
supabase functions deploy get-upload-url
supabase functions deploy document-validation
supabase functions deploy activity-logger
```

## Security Best Practices Followed

✅ Service role key never exposed to frontend
✅ Service role key only in edge functions (server-side)
✅ All client operations use anon key + RLS
✅ Admin operations verified before calling edge functions
✅ Edge functions verify admin role before executing privileged operations

## Conclusion

The codebase is now production-ready. The only operation requiring service role key (`auth.admin.deleteUser`) has been moved to an edge function where it can safely access the service role key via environment variables.
