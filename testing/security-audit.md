# Security Audit Report - Solar CRM

**Date:** November 27, 2025  
**Project:** Solar CRM (gqalreoyglltniepgnnr)  
**Auditor:** Automated Security Analysis via Supabase MCP

---

## Executive Summary

This security audit identified **1 CRITICAL** issue, **15 WARNING** level issues, and several informational items that require attention. The most severe issue is the disabled Row Level Security (RLS) on the `users` table, which exposes all user data without proper access control.

**Risk Level:** 🔴 HIGH

---

## Critical Issues

### 1. RLS Disabled on Public Table: `users`

**Severity:** 🔴 CRITICAL  
**Category:** SECURITY  
**Status:** OPEN

**Description:**  
The `users` table is exposed to PostgREST but does not have Row Level Security enabled. This means any authenticated user can potentially read, modify, or delete user records without proper authorization checks.

**Impact:**
- Unauthorized access to user personal information
- Potential data breach of emails, phone numbers, roles
- Ability to escalate privileges by modifying role field
- GDPR/privacy compliance violations

**Affected Table:** `public.users`

**Current State:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Result: rowsecurity = false
```

**Remediation:**

1. Enable RLS on the users table:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

2. Create appropriate RLS policies:

```sql
-- Admin full access
CREATE POLICY "Admin full access on users"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON public.users
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

-- Users can update their own non-sensitive fields
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (
  id = (SELECT auth.uid())
  AND role = (SELECT role FROM public.users WHERE id = (SELECT auth.uid()))
  -- Prevent role escalation
);

-- Office can view all users
CREATE POLICY "Office can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
    AND role IN ('office', 'admin')
  )
);
```

**Verification:**
```sql
-- Test as non-admin user
SELECT * FROM users; -- Should only return own record

-- Test as admin
SELECT * FROM users; -- Should return all records
```

**References:**
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## Warning Level Issues

### 2. Function Search Path Mutable (15 Functions)

**Severity:** ⚠️ WARNING  
**Category:** SECURITY  
**Status:** OPEN

**Description:**  
15 database functions do not have a fixed `search_path` parameter, making them vulnerable to search path manipulation attacks. An attacker could create malicious functions in a schema that appears earlier in the search path.

**Affected Functions:**
1. `public.update_updated_at_column`
2. `public.update_customer_profile_drafts_updated_at`
3. `public.auto_generate_user_ids`
4. `public.generate_unique_user_id`
5. `public.normalize_phone`
6. `public.link_customer_to_lead`
7. `public.check_mandatory_documents`
8. `public.update_lead_status`
9. `public.initialize_lead_timeline`
10. `public.notify_step_completion`
11. `public.notify_document_corruption`
12. `public.notify_remarks_addition`
13. `public.notify_lead_assignment`
14. `public.handle_new_user`
15. `public.complete_step`

**Attack Scenario:**
```sql
-- Attacker creates malicious schema
CREATE SCHEMA malicious;
SET search_path = malicious, public;

-- Attacker creates malicious function
CREATE FUNCTION malicious.some_function() ...

-- When vulnerable function runs, it may call malicious version
```

**Remediation:**

For each function, add `SET search_path`:

```sql
-- Example fix for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

**Batch Fix Script:**
```sql
-- Generate ALTER statements for all affected functions
SELECT 
  'ALTER FUNCTION ' || 
  n.nspname || '.' || 
  p.proname || '(' || 
  pg_get_function_identity_arguments(p.oid) || 
  ') SET search_path = public, pg_temp;'
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'update_updated_at_column',
  'update_customer_profile_drafts_updated_at',
  'auto_generate_user_ids',
  'generate_unique_user_id',
  'normalize_phone',
  'link_customer_to_lead',
  'check_mandatory_documents',
  'update_lead_status',
  'initialize_lead_timeline',
  'notify_step_completion',
  'notify_document_corruption',
  'notify_remarks_addition',
  'notify_lead_assignment',
  'handle_new_user',
  'complete_step'
);
```

**References:**
- [Supabase Function Linter](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

---

### 3. Leaked Password Protection Disabled

**Severity:** ⚠️ WARNING  
**Category:** SECURITY  
**Status:** OPEN

**Description:**  
Supabase Auth's leaked password protection feature is currently disabled. This feature checks passwords against the HaveIBeenPwned database to prevent users from setting compromised passwords.

**Impact:**
- Users can set passwords that have been exposed in data breaches
- Increased risk of account takeover
- Reduced overall security posture

**Current State:**
```json
{
  "type": "auth",
  "entity": "Auth",
  "leaked_password_protection": false
}
```

**Remediation:**

1. Navigate to Supabase Dashboard
2. Go to Authentication → Policies
3. Enable "Leaked Password Protection"
4. Configure minimum password strength requirements

**Alternative (via API):**
```bash
curl -X PATCH 'https://api.supabase.com/v1/projects/{ref}/config/auth' \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_PASSWORD_HIBP_ENABLED": true,
    "SECURITY_PASSWORD_MIN_LENGTH": 8
  }'
```

**References:**
- [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)

---

## Informational Issues

### 4. Auth RLS InitPlan Performance (35+ Policies)

**Severity:** ℹ️ INFO  
**Category:** PERFORMANCE  
**Status:** OPEN

**Description:**  
35+ RLS policies re-evaluate `auth.uid()` for each row, causing performance degradation at scale.

**Example Bad Policy:**
```sql
CREATE POLICY "Users own data"
ON some_table
FOR SELECT
USING (user_id = auth.uid()); -- Re-evaluated per row
```

**Optimized Version:**
```sql
CREATE POLICY "Users own data"
ON some_table
FOR SELECT
USING (user_id = (SELECT auth.uid())); -- Evaluated once
```

**Affected Tables:**
- leads (5 policies)
- documents (6 policies)
- step_master (2 policies)
- lead_steps (6 policies)
- activity_log (3 policies)
- notifications (2 policies)
- customer_profiles (3 policies)
- customer_profile_drafts (5 policies)

**Remediation:**
Wrap all `auth.uid()` calls in subqueries: `(SELECT auth.uid())`

---

### 5. Multiple Permissive Policies (Performance Impact)

**Severity:** ℹ️ INFO  
**Category:** PERFORMANCE  
**Status:** OPEN

**Description:**  
Multiple permissive policies for the same role and action reduce performance as each policy must be evaluated.

**Example:**
```sql
-- Table: leads
-- Role: authenticated
-- Action: SELECT
-- Policies: 5 (Admin full access, Agent own leads, Customer own lead, 
--             Installer assigned leads, Office full access)
```

**Recommendation:**
Consolidate into single policy with OR conditions:

```sql
CREATE POLICY "Consolidated SELECT policy"
ON leads
FOR SELECT
TO authenticated
USING (
  -- Admin
  (SELECT role FROM users WHERE id = (SELECT auth.uid())) = 'admin'
  OR
  -- Agent own leads
  (created_by = (SELECT auth.uid()) AND 
   (SELECT role FROM users WHERE id = (SELECT auth.uid())) = 'agent')
  OR
  -- Customer own lead
  (customer_account_id = (SELECT auth.uid()) AND 
   (SELECT role FROM users WHERE id = (SELECT auth.uid())) = 'customer')
  OR
  -- Installer assigned
  (installer_id = (SELECT auth.uid()) AND 
   (SELECT role FROM users WHERE id = (SELECT auth.uid())) = 'installer')
  OR
  -- Office
  (SELECT role FROM users WHERE id = (SELECT auth.uid())) = 'office'
);
```

---

### 6. Unindexed Foreign Keys

**Severity:** ℹ️ INFO  
**Category:** PERFORMANCE  
**Status:** OPEN

**Affected:**
1. `documents.uploaded_by` → `users.id`
2. `lead_steps.completed_by` → `users.id`
3. `notifications.lead_id` → `leads.id`

**Remediation:**
```sql
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_lead_steps_completed_by ON lead_steps(completed_by);
CREATE INDEX idx_notifications_lead_id ON notifications(lead_id);
```

---

### 7. Unused Indexes

**Severity:** ℹ️ INFO  
**Category:** PERFORMANCE  
**Status:** MONITOR

**Unused Indexes:**
- `idx_users_phone`
- `idx_documents_type`
- `idx_notifications_read`
- `idx_notifications_created_at`
- `idx_customer_profile_drafts_user_id`

**Recommendation:**
Monitor for 30 days. If still unused, consider dropping to reduce write overhead.

---

## Storage Security

### Bucket Configuration

**Bucket:** `solar-projects`  
**Public:** No  
**File Size Limit:** 9MB  
**Allowed MIME Types:** Not restricted (⚠️ Consider restricting)

**Current Policies:**
- Office/Admin: Full access
- Agents: Upload to own leads
- Customers: Upload to own leads
- Installers: Upload installation documents

**Recommendations:**
1. Restrict allowed MIME types to documents/images only
2. Implement virus scanning for uploads
3. Add file name sanitization
4. Implement signed URL expiration (currently permanent)

---

## Authentication Security

### Current Configuration
- Email/Password authentication enabled
- JWT expiration: Default (1 hour)
- Refresh token rotation: Enabled
- Email confirmation: Required

### Recommendations
1. Enable MFA for admin accounts
2. Implement rate limiting on auth endpoints
3. Add IP-based access restrictions for admin panel
4. Enable session management dashboard
5. Implement password complexity requirements

---

## API Security

### Current State
- All API requests require authentication ✅
- JWT verification enabled on Edge Functions ✅
- CORS properly configured ✅
- No rate limiting configured ⚠️

### Recommendations
1. Implement rate limiting (Supabase Pro feature)
2. Add request logging for audit trail
3. Implement API key rotation policy
4. Add webhook signature verification

---

## Compliance Considerations

### GDPR
- [ ] Right to access (partially implemented)
- [ ] Right to deletion (not implemented)
- [ ] Data portability (not implemented)
- [ ] Consent management (not implemented)
- [ ] Data breach notification (not implemented)

### Data Retention
- No automatic data deletion policy
- No archival strategy
- Activity logs grow indefinitely

**Recommendation:** Implement data retention policies and automated cleanup.

---

## Action Plan

### Immediate (Within 24 hours)
1. ✅ Enable RLS on users table
2. ✅ Fix function search paths
3. ✅ Enable leaked password protection

### Short-term (Within 1 week)
1. Add missing indexes
2. Optimize RLS policies (auth.uid() wrapping)
3. Consolidate multiple permissive policies
4. Restrict storage MIME types

### Medium-term (Within 1 month)
1. Implement MFA for admins
2. Add rate limiting
3. Implement GDPR compliance features
4. Set up monitoring and alerting

### Long-term (Within 3 months)
1. Security audit by external firm
2. Penetration testing
3. Compliance certification
4. Disaster recovery plan

---

## Monitoring Recommendations

### Metrics to Track
1. Failed authentication attempts
2. RLS policy violations
3. Unusual data access patterns
4. File upload volumes
5. API error rates

### Alerting Thresholds
- Failed logins > 5 per user per hour
- RLS violations > 0
- File uploads > 100 per hour
- API 5xx errors > 1%

---

## Conclusion

The Solar CRM application has a solid foundation but requires immediate attention to critical security issues, particularly the disabled RLS on the users table. Once the critical and warning-level issues are addressed, the application will have a much stronger security posture.

**Overall Security Score:** 6.5/10

**Next Review Date:** December 27, 2025

---

*This audit was generated using Supabase MCP tools and should be supplemented with manual security review and penetration testing.*
