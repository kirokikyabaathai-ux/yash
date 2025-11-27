# Solar CRM - Comprehensive Testing Documentation

**Project:** Solar CRM  
**Supabase Project ID:** gqalreoyglltniepgnnr  
**Organization ID:** ommnvbhaevcwxumliojo  
**Region:** ap-south-1  
**Status:** ACTIVE_HEALTHY  
**Database Version:** PostgreSQL 17.6.1.052  
**Generated:** November 27, 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [Security Analysis](#security-analysis)
4. [Performance Analysis](#performance-analysis)
5. [API Testing](#api-testing)
6. [Edge Functions](#edge-functions)
7. [Test Data](#test-data)
8. [Known Issues](#known-issues)
9. [Recommendations](#recommendations)

---

## Project Overview

This is a comprehensive Solar CRM system built with Next.js and Supabase. The system manages the complete lifecycle of solar installation projects from lead generation to project completion.

### Key Features
- Multi-role user management (Admin, Agent, Office, Installer, Customer)
- Lead lifecycle tracking
- Document management with Supabase Storage
- Timeline-based workflow system
- Customer portal
- Automated notifications
- RLS (Row Level Security) policies

### Tech Stack
- **Frontend:** Next.js 16.0.3, React 19.2.0
- **Backend:** Supabase (PostgreSQL 17.6.1)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS 4
- **Testing:** Jest 30.2.0

---

## Database Schema

### Tables Overview

#### 1. users
- **Rows:** 4
- **RLS Enabled:** ❌ **CRITICAL SECURITY ISSUE**
- **Purpose:** Stores all user accounts across roles

**Columns:**
- `id` (uuid, PK)
- `email` (text, unique)
- `name` (text)
- `phone` (text, unique) - Validated: 10 digits starting with 1-9
- `role` (text) - Values: admin, agent, office, installer, customer
- `status` (text) - Values: active, disabled
- `assigned_area` (text, nullable)
- `agent_id` (text, unique, nullable) - Visible ID for agents
- `office_id` (text, unique, nullable) - Visible ID for offices
- `customer_id` (text, unique, nullable) - Visible ID for customers
- `created_at`, `updated_at` (timestamptz)

#### 2. leads
- **Rows:** 3
- **RLS Enabled:** ✅
- **Purpose:** Tracks solar installation leads

**Columns:**
- `id` (uuid, PK)
- `customer_name` (text)
- `phone` (text) - Validated: 10 digits
- `email` (text, nullable)
- `address` (text)
- `notes` (text, nullable)
- `status` (text) - Values: lead, lead_interested, lead_processing, lead_completed, lead_cancelled
- `created_by` (uuid, FK → users)
- `customer_account_id` (uuid, FK → users)
- `installer_id` (uuid, FK → users)
- `source` (text) - Values: agent, office, customer, self
- `created_at`, `updated_at` (timestamptz)

#### 3. documents
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** Manages document uploads

**Columns:**
- `id` (uuid, PK)
- `lead_id` (uuid, FK → leads)
- `type` (text) - Values: mandatory, optional, installation, customer, admin
- `document_category` (text)
- `file_path` (text)
- `file_name` (text)
- `file_size` (bigint)
- `mime_type` (text)
- `uploaded_by` (uuid, FK → users)
- `status` (text) - Values: valid, corrupted, replaced
- `uploaded_at` (timestamptz)

#### 4. step_master
- **Rows:** 22
- **RLS Enabled:** ✅
- **Purpose:** Defines workflow steps (admin-editable)

**Columns:**
- `id` (uuid, PK)
- `step_name` (text)
- `order_index` (numeric) - Uses fractional ordering for flexibility
- `allowed_roles` (text[])
- `remarks_required` (boolean)
- `attachments_allowed` (boolean)
- `customer_upload` (boolean)
- `requires_installer_assignment` (boolean)
- `created_at`, `updated_at` (timestamptz)

#### 5. lead_steps
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** Tracks step completion for each lead

**Columns:**
- `id` (uuid, PK)
- `lead_id` (uuid, FK → leads)
- `step_id` (uuid, FK → step_master)
- `status` (text) - Values: upcoming, pending, completed
- `completed_by` (uuid, FK → users)
- `completed_at` (timestamptz)
- `remarks` (text, nullable)
- `attachments` (text[], nullable)
- `created_at`, `updated_at` (timestamptz)

#### 6. activity_log
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** Audit trail for all actions

**Columns:**
- `id` (uuid, PK)
- `lead_id` (uuid, FK → leads, nullable)
- `user_id` (uuid, FK → users)
- `action` (text)
- `entity_type` (text)
- `entity_id` (uuid, nullable)
- `old_value` (jsonb, nullable)
- `new_value` (jsonb, nullable)
- `timestamp` (timestamptz)

#### 7. notifications
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** User notifications

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `lead_id` (uuid, FK → leads, nullable)
- `type` (text)
- `title` (text)
- `message` (text)
- `read` (boolean, default: false)
- `created_at` (timestamptz)

#### 8. customer_profiles
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** Detailed customer information (PM Suryaghar form data)

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → users, nullable)
- `lead_id` (uuid, FK → leads, nullable)
- `name`, `gender`, `address_line_1`, `address_line_2`
- `pin_code`, `state`, `district`
- `account_holder_name`, `bank_account_number`, `bank_name`, `ifsc_code`
- Document paths: `aadhaar_front_path`, `aadhaar_back_path`, `electricity_bill_path`, `bank_passbook_path`, `cancelled_cheque_path`, `pan_card_path`, `itr_documents_path`
- `created_at`, `updated_at` (timestamptz)

#### 9. customer_profile_drafts
- **Rows:** 0
- **RLS Enabled:** ✅
- **Purpose:** Stores partial form data for later completion

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → users)
- `lead_id` (uuid, FK → leads, nullable)
- `draft_data` (jsonb)
- `created_at`, `updated_at` (timestamptz)

---

## Security Analysis

### Critical Issues

#### 1. RLS Disabled on `users` Table ❌
**Severity:** CRITICAL  
**Impact:** All user data is publicly accessible without proper access control  
**Recommendation:** Enable RLS immediately and create appropriate policies

#### 2. Leaked Password Protection Disabled ⚠️
**Severity:** WARNING  
**Impact:** Users can set compromised passwords  
**Recommendation:** Enable HaveIBeenPwned integration in Supabase Auth settings

### Function Security Issues

**15 Functions with Mutable Search Path** ⚠️  
Functions without fixed `search_path` are vulnerable to search path attacks.

**Affected Functions:**
- `update_updated_at_column`
- `update_customer_profile_drafts_updated_at`
- `auto_generate_user_ids`
- `generate_unique_user_id`
- `normalize_phone`
- `link_customer_to_lead`
- `check_mandatory_documents`
- `update_lead_status`
- `initialize_lead_timeline`
- `notify_step_completion`
- `notify_document_corruption`
- `notify_remarks_addition`
- `notify_lead_assignment`
- `handle_new_user`
- `complete_step`

**Fix:** Add `SET search_path = public, pg_temp` to each function definition.

---

## Performance Analysis

### Unindexed Foreign Keys ℹ️

**Impact:** Suboptimal query performance on joins

**Affected Tables:**
1. `documents.uploaded_by` → `users.id`
2. `lead_steps.completed_by` → `users.id`
3. `notifications.lead_id` → `leads.id`

**Recommendation:**
```sql
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_lead_steps_completed_by ON lead_steps(completed_by);
CREATE INDEX idx_notifications_lead_id ON notifications(lead_id);
```

### Auth RLS InitPlan Issues ⚠️

**Impact:** RLS policies re-evaluate `auth.uid()` for each row, causing performance degradation at scale

**Affected:** 35+ RLS policies across all tables

**Fix Pattern:**
```sql
-- Bad (re-evaluates for each row)
WHERE user_id = auth.uid()

-- Good (evaluates once)
WHERE user_id = (SELECT auth.uid())
```

### Multiple Permissive Policies ⚠️

**Impact:** Multiple policies for same role/action reduce performance

**Affected:** All major tables with 3-5 overlapping policies per action

**Recommendation:** Consolidate policies using OR conditions

### Unused Indexes ℹ️

**Indexes that have never been used:**
- `idx_users_phone`
- `idx_documents_type`
- `idx_notifications_read`
- `idx_notifications_created_at`
- `idx_customer_profile_drafts_user_id`

**Recommendation:** Monitor usage; consider dropping if consistently unused

---

## API Testing

### Recent API Activity (Last 100 requests)

**Most Common Endpoints:**
1. `GET /rest/v1/step_master` - Fetching workflow steps
2. `GET /rest/v1/users` - User data retrieval
3. `GET /rest/v1/leads` - Lead listing
4. `GET /auth/v1/user` - Auth verification
5. `DELETE /rest/v1/step_master` - Step deletion (admin)

**Status Codes:**
- ✅ 200 OK - Majority of requests
- ✅ 204 No Content - Successful deletions
- ✅ No 4xx/5xx errors in recent logs

**Authentication:**
- All requests properly authenticated
- Admin user active: `admin@solarcrm.com`

---

## Edge Functions

### Deployed Functions

#### 1. get-upload-url
- **Status:** ACTIVE
- **Version:** 1
- **Purpose:** Generates signed URLs for file uploads
- **JWT Verification:** Enabled

#### 2. document-validation
- **Status:** ACTIVE
- **Version:** 1
- **Purpose:** Validates uploaded documents
- **JWT Verification:** Enabled

#### 3. activity-logger
- **Status:** ACTIVE
- **Version:** 1
- **Purpose:** Logs user activities
- **JWT Verification:** Enabled

#### 4. create-user
- **Status:** ACTIVE
- **Version:** 2 (Updated)
- **Purpose:** Creates new users with role assignment
- **JWT Verification:** Enabled
- **Last Updated:** November 27, 2025

---

## Test Data

### Current Users (4 total)

#### 1. Admin User
```json
{
  "id": "0d007432-c2a9-4539-9fca-00321a608806",
  "email": "admin@solarcrm.com",
  "name": "Admin User",
  "phone": "9999999999",
  "role": "admin",
  "status": "active"
}
```

#### 2-4. Customer Users
```json
[
  {
    "customer_id": "YN16891188C",
    "email": "testuser@example.com",
    "name": "Test User",
    "phone": "9876543210",
    "role": "customer"
  },
  {
    "customer_id": "YN74304492C",
    "email": "abhibhai1507@gmail.com",
    "name": "aashish",
    "phone": "1234123412",
    "role": "customer"
  },
  {
    "customer_id": "YN32187570C",
    "email": "ashishsahu1504@gmail.com",
    "name": "Aashish Sahu",
    "phone": "7220880608",
    "role": "customer"
  }
]
```

### Current Leads (3 total)

All leads are auto-created from customer signups with:
- Status: `lead`
- Source: `self`
- Notes: "Auto-created lead from customer signup"

### Workflow Steps (22 total)

Sample steps with fractional ordering:
- Order 1000: Customer upload step
- Order 3000: "Lead Created"
- Order 5000: Installer step
- Order 8000: Document upload
- Order 11000: "Subsidy Application"
- Order 13000: "Installation"

---

## Known Issues

### 1. Data Quality Issues
- **Step Master:** Several steps have corrupted names (e.g., ",z;+", "%W", "__")
- **Impact:** UI display issues, workflow confusion
- **Fix:** Clean up step names via admin panel

### 2. Duplicate Roles in allowed_roles
- Some steps have duplicate roles in the array
- Example: `["customer", "agent", "agent"]`
- **Fix:** Deduplicate arrays

### 3. Missing Migrations Documentation
- 60+ migrations applied
- No rollback strategy documented
- **Recommendation:** Document migration dependencies

---

## Recommendations

### Immediate Actions (Critical)

1. **Enable RLS on users table**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   -- Add appropriate policies
   ```

2. **Fix function search paths**
   ```sql
   ALTER FUNCTION function_name() SET search_path = public, pg_temp;
   ```

3. **Enable leaked password protection**
   - Go to Supabase Dashboard → Authentication → Password Protection
   - Enable HaveIBeenPwned integration

### Short-term Improvements

1. **Add missing indexes**
2. **Consolidate RLS policies**
3. **Clean up step_master data**
4. **Optimize auth.uid() calls in RLS**

### Long-term Enhancements

1. **Implement comprehensive testing suite**
2. **Add database backup strategy**
3. **Set up monitoring and alerting**
4. **Document API endpoints**
5. **Create migration rollback procedures**

---

## Testing Checklist

### Authentication
- [ ] Admin login
- [ ] Customer signup
- [ ] Agent login
- [ ] Password reset
- [ ] Session management

### Lead Management
- [ ] Create lead (agent)
- [ ] Create lead (customer self-signup)
- [ ] Update lead status
- [ ] Assign installer
- [ ] View lead timeline

### Document Management
- [ ] Upload mandatory documents
- [ ] Upload optional documents
- [ ] Mark document as corrupted
- [ ] Customer re-upload
- [ ] View documents by role

### Workflow
- [ ] Initialize lead timeline
- [ ] Complete step (office)
- [ ] Complete step (installer)
- [ ] Skip step (admin)
- [ ] Reorder steps (admin)

### Permissions
- [ ] Agent can only see own leads
- [ ] Customer can only see own lead
- [ ] Office can see all leads
- [ ] Installer can only see assigned leads
- [ ] Admin has full access

### Notifications
- [ ] Step completion notification
- [ ] Document corruption notification
- [ ] Lead assignment notification
- [ ] Mark notification as read

---

## Contact & Support

**Project Owner:** Solar CRM Team  
**Supabase Project:** [See Supabase Dashboard]  
**Documentation:** See Project Specification.md

---

*Last Updated: November 27, 2025*
