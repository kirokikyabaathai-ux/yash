

# **SOLAR CRM – COMPLETE SYSTEM DESIGN & TECHNICAL SPECIFICATION**

# ===================================================================

This document describes the **full architecture**, **functional requirements**, **data model**, **flows**, **roles**, **permissions**, **timeline system**, **Supabase storage design**, **customer portal**, and **backend rules** for your CRM.

It includes:

* Business Requirements
* Functional Requirements
* Role Definitions
* Timelines & Workflow Engine
* Document Upload System
* PM Suryaghar Form
* Lead Lifecycle
* Customer Portal
* Supabase Storage & Signed URL Model
* Step Master (Admin Editable)
* Permission Matrix
* API Structure
* Database Schema
* Security Model
* Activity Logs
* Full Flow Diagrams

Everything here is exhaustive.

---

# ==========================================================

# **1. SYSTEM OVERVIEW**

# ==========================================================

A Solar CRM system where:

* **Agents** generate leads
* **Customers** can self-signup or track their lead
* **Office team** processes leads through solar installation steps
* **Installers** update installation-related tasks
* **Admin** has full superuser access
* **A timeline tracks all steps** of a solar rooftop project
* **Documents & PM Suryaghar forms** are uploaded and validated
* **Supabase storage with signed URLs** secures files
* **Lead linking logic** joins customer accounts with existing leads

Final objective:
Track solar installation from **Lead → Survey → Proposal → Payment/Loan → Installation → Net Meter → Subsidy → Closure**.

---

# ==========================================================

# **2. USER ROLES AND PERMISSIONS**

# ==========================================================

There are **5 main roles**:

* **Admin**
* **Agent**
* **Office Team**
* **Installer**
* **Customer**

Below is the full permissions table.

---

## **2.1 ADMIN (SUPERUSER)**

Admin can:

* Login
* Create/disable/edit all accounts (Agent, Office, Installer, Customer)
* Create/Edit/Delete **all steps** of timeline
* Assign **step permissions**:

  * admin only
  * office + admin
  * installer only
  * customer upload
  * agent upload
* Edit any lead
* Override any permission
* Delete or replace any document
* Mark any step completed
* Move timeline backward
* Skip steps
* View all dashboards
* Access entire Supabase storage via signed URLs
* Review and resolve document corruption
* Full audit log visibility

**Admin = Full unrestricted access to the entire system.**

---

## **2.2 AGENT**

Agent can:

* Create leads
* Upload mandatory + optional documents (only for own leads)
* Fill PM Suryaghar form (own leads)
* View own leads only
* See timeline (read-only unless admin provides special permission for a step)

Agent cannot:

* Modify steps (unless admin allows on specific steps)
* Modify other users' leads
* View admin/office dashboards
* Change lead assignment

---

## **2.3 OFFICE TEAM**

Office can:

* View all leads
* Fill/edit PM Suryaghar for any lead
* Upload documents for any lead
* Update timeline steps (if allowed by admin for that step)
* Schedule and complete surveys
* Send proposals
* Mark payments
* Update loan status
* Schedule installation
* Mark net meter process
* Complete commissioning
* Apply subsidy
* Close project

Office cannot:

* Modify Step Master
* Create admin users
* Override admin-only restricted steps

---

## **2.4 INSTALLER**

Installer can:

* View only installation-assigned leads
* Upload installation photos
* Update installation progress steps
* Complete installation step
* Submit installation certificate

Installer cannot see:

* PM Suryaghar
* Financial details
* Survey details
* Office/Admin dashboards

---

## **2.5 CUSTOMER**

Customer can:

* Create account
* Login
* View full timeline
* Upload missing/corrupted documents
* Fill PM Suryaghar form (if not completed yet)
* View proposal, payments, status

Customer cannot:

* Modify step status
* Replace office/admin uploads
* Edit lead fields
* Delete leads

---

# ==========================================================

# **3. LEAD MANAGEMENT SYSTEM**

# ==========================================================

## **3.1 Lead Creation Sources**

A lead can be created by:

* Agent
* Office
* Admin
* Customer (self-signup)

### Lead Fields:

* Name
* Phone
* Email
* Address
* KW requirement
* Roof type
* Notes

### Lead Status:

1. **Lead** (default) - Initial contact, agent found the person
2. **Lead Interested** - Customer agreed to proceed
3. **Lead Processing** - Form filled + active project (timeline updates)
4. **Lead Completed** - Project finished
5. **Lead Cancelled** - Customer declined/withdrew

---

## **3.2 Lead Status Rules**

Lead status progresses as follows:

1. **Lead** → Initial status when lead is created (agent found person)
2. **Lead Interested** → When customer agrees to proceed
3. **Lead Processing** → When customer form is filled and documents are uploaded (automatic)
4. **Lead Completed** → When all timeline steps are completed
5. **Lead Cancelled** → When customer withdraws or lead is cancelled

Admin can override status anytime.

---

## **3.3 Lead Ownership**

* Leads created by an **Agent** → belong to agent
* Leads created by **Customer** → belong to customer
* Office/Admin → can access all leads
* Installer → installation stage only

---

# ==========================================================

# **4. CUSTOMER MODULE**

# ==========================================================

## **4.1 Customer Account Creation**

Customer provides:

* Name
* Phone (PRIMARY KEY)
* Email
* Password

### System checks:

```
if phone exists in leads:
    link customer to that lead
else:
    create new lead
```

### If lead exists:

* Link customer to lead
* Customer sees timeline
* Customer can upload documents

### If lead does not exist:

* Create lead with:

  * created_by = customer
  * source = "self" or "website"
* Customer can now complete PM Suryaghar and documents

---

## **4.2 Customer Timeline View**

Customers see:

* All steps
* Status (Completed / Pending / Upcoming)
* Remarks
* Office/Admin updates
* Document upload buttons (if required)

---

## **4.3 Customer Document Upload Flow**

Triggered when:

* Missing mandatory docs
* Corrupted docs
* Step requires customer upload
* Admin adds new upload step

Flow:

1. Customer clicks upload
2. Backend returns **signed upload URL**
3. Customer uploads directly to Supabase
4. Timeline updates
5. Admin/office notified

---

# ==========================================================

# **5. DOCUMENT MANAGEMENT**

# ==========================================================

## **5.1 Mandatory Documents**

Required for PM Suryaghar + Lead validation:

1. Aadhar Front
2. Aadhar Back
3. Bijli Bill
4. Bank Passbook
5. Cancelled Cheque
6. PAN Card

Lead cannot move to Lead Processing without them.

---

## **5.2 Optional Documents**

* ITR (multiple)
* Other documents (multiple)

---

## **5.3 Storage Structure (Supabase)**

```
bucket: solar-projects

/leads/{lead_id}/mandatory/
/leads/{lead_id}/optional/
/leads/{lead_id}/installer/
/leads/{lead_id}/customer/
/leads/{lead_id}/admin/
```

Files uploaded under respective folders.

---

## **5.4 File Upload via Signed URLs**

Backend generates:

```
createSignedUploadUrl("leads/{lead_id}/{type}/{uuid}.png")
```

Roles permitted to upload:

* Admin
* Office
* Agent (own leads only)
* Customer (customer-upload steps only)
* Installer (installation-only)

---

## **5.5 Corrupted File Handling**

Admin/office can mark file as:

```
document_status = corrupted
```

System creates new timeline step:

```
Customer re-upload required
```

Customer gets upload button.

---

# ==========================================================

# **6. PM SURYAGHAR FORM**

# ==========================================================

Form sections include:

* Applicant details
* Property details
* Government IDs
* KW requirement
* Roof type
* Document confirmation

Form can be filled by:

* Agent (own leads)
* Customer (self-created lead or agent-created if pending)
* Office/Admin

On submission:

* Lead status updates to **Lead Processing**
* Timeline moves to “PM Suryaghar Submitted”

---

# ==========================================================

# **7. TIMELINE / WORKFLOW ENGINE**

# ==========================================================

The timeline represents the entire solar project lifecycle.

---

## **7.1 Step Master (Admin Editable)**

Admin can:

* Add step
* Delete step
* Reorder steps
* Rename steps
* Set allowed_roles per step
* Set attachment_required
* Set remarks_required
* Set customer_upload flag
* Make steps admin-only

---

## **7.2 Default Steps (Initial Template)**

1. Lead Created
2. PM Suryaghar Submitted
3. Application Started
4. Survey Scheduled
5. Survey Completed
6. Proposal Sent
7. Payment or Loan Option
8. Payment Received / Loan Flow
9. Installation Scheduled
10. Installation Completed
11. Net Meter Applied
12. Commissioning
13. Subsidy Submitted
14. Subsidy Released
15. Project Closed

Admin can delete any step and add new ones.

---

## **7.3 Step Completion Flow**

1. User opens step
2. Checks permission
3. Uploads file / enters remarks
4. Marks step as completed
5. System auto-updates next step

---

## **7.4 Step Permissions**

### Step Fields:

```
allowed_roles: ["admin", "office", "installer", "agent", "customer"]
remarks_required: boolean
attachments_allowed: boolean
customer_upload: boolean
```

Admin override always allowed.

---

# ==========================================================

# **8. COMPLETE FLOW (END-TO-END)**

# ==========================================================

```
Lead Created
    ↓
Mandatory Documents Upload
    ↓
PM Suryaghar Form Submitted
    ↓
Lead status → Lead Processing
    ↓
Application Started
    ↓
Survey Scheduled
    ↓
Survey Completed
    ↓
Proposal & Quotation Sent
    ↓
Payment / Loan Path
    ↓
Installation Scheduled
    ↓
Installation Completed
    ↓
Net Meter Applied
    ↓
Commissioning
    ↓
Subsidy Submitted
    ↓
Subsidy Released
    ↓
Project Closed
```

Customer sees ALL these in timeline.

---

# ==========================================================

# **9. DATABASE SCHEMA**

# ==========================================================

I will summarize key tables:

---

## **users**

* id
* name
* phone
* email
* role
* password_hash
* status

---

## **leads**

* id
* customer_name
* phone
* email
* address
* status
* created_by (user_id or "customer")
* customer_account_id
* source
* created_at

---

## **documents**

* id
* lead_id
* type
* file_path
* uploaded_by
* status (valid/corrupted)
* uploaded_at

---

## **step_master**

* id
* step_name
* order_index
* allowed_roles[]
* remarks_required
* attachments_allowed
* customer_upload

---

## **lead_steps**

* id
* lead_id
* step_id
* status
* completed_by
* completed_at
* remarks
* attachments

---

## **pm_suryaghar_form**

* id
* lead_id
* json_data
* submitted_by
* submitted_at

---

## **activity_log**

* id
* lead_id
* user_id
* action
* timestamp
* old_value
* new_value

---

# ==========================================================

# **10. SECURITY**

# ==========================================================

### Storage:

* All buckets PRIVATE
* All uploads via signed URLs

### API:

* JWT authentication
* Middleware permission-checks
* Step-level permissions validated
* Lead ownership enforced for agents & customers

### Customer:

* Cannot see other customers’ leads
* Cannot bypass upload restrictions

---

# ==========================================================

# **11. API STRUCTURE (SUMMARY)**

# ==========================================================

## Auth:

* POST /auth/login

## Lead:

* POST /leads
* GET /leads
* GET /leads/:id
* PATCH /leads/:id

## Documents:

* POST /leads/:id/documents/upload-link
* GET /leads/:id/documents

## Steps:

* GET /steps
* POST /steps
* PATCH /steps/:id
* DELETE /steps/:id
* PUT /steps/reorder

## Lead Steps:

* POST /leads/:id/steps/:step_id/complete
* PATCH /leads/:id/steps/:step_id/edit
* POST /leads/:id/steps/:step_id/reopen

## PM Suryaghar:

* POST /leads/:id/pmsuryaghar

---

# ==========================================================


Perfect.
Since you are using **Supabase as Backend** and **Next.js as Frontend**, below is the **complete, production-ready implementation plan** for your Solar CRM system.

This includes:

1. Supabase Architecture (Auth + DB + Storage + RLS)
2. Next.js Architecture (App Router)
3. API Routes Design
4. File Upload Flow (Signed URLs in Supabase)
5. Customer Linking Logic
6. Timeline System Implementation
7. Role-Based Permissions at Supabase Level
8. Folder Structure for Backend + Frontend
9. Recommended Libraries
10. Deployment Strategy

This is the **final implementation blueprint** for your full system.

---

# =====================================================================

# **1. SUPABASE BACKEND ARCHITECTURE**

# =====================================================================

Supabase handles:

* Authentication
* Database (PostgreSQL)
* Storage
* Row-Level Security (RLS)
* API (SQL + Edge Functions)

Everything runs serverless → integrates perfectly with Next.js.

---

# ==========================================================

# **2. AUTHENTICATION MODEL (SUPABASE AUTH)**

# ==========================================================

You will use **Supabase Auth** for:

* Admin
* Agent
* Office
* Installer
* Customer

Each user gets a Supabase Auth account.

### Users Table (Supabase Auth + Public Profile)

Your table:

`users`

Must reference Supabase `auth.users` via:

```
id UUID PRIMARY KEY DEFAULT auth.uid()
```

Store:

* name
* phone
* email
* role
* status
* assigned_area (optional)
* created_at

---

# ==========================================================

# **3. DATABASE SCHEMA (SUPABASE POSTGRES)**

# ==========================================================

Key tables:

### 1. users

### 2. leads

### 3. documents

### 4. step_master

### 5. lead_steps

### 6. pm_suryaghar_form

### 7. activity_log

### 8. customer_accounts (optional)

Supabase SQL tables and relations match exactly the schema provided earlier.

---

# ==========================================================

# **4. STORAGE (SUPABASE STORAGE)**

# ==========================================================

Bucket:

```
solar-projects
```

Structure:

```
/leads/{lead_id}/mandatory/
/leads/{lead_id}/optional/
/leads/{lead_id}/installation/
/leads/{lead_id}/customer/
/leads/{lead_id}/admin/
```

Each file uses a UUID name.

---

# ==========================================================

# **5. RLS POLICIES (CRITICAL PART)**

# ==========================================================

This is how you enforce permissions.

---

### **5.1 RLS for leads**

Agents:

```
agent can select/update only leads where leads.created_by = auth.uid()
```

Customers:

```
customer can select/update only leads where leads.customer_id = auth.uid()
```

Office/Admin:

```
office/admin can select all
```

Installer:

```
installer can select only assigned installation leads
```

---

### **5.2 RLS for documents**

Documents table rules:

Agents:

```
uploaded_by = auth.uid()
```

Customers:

```
lead.customer_id = auth.uid()
```

Office/Admin:

```
role IN ('office','admin')
```

Installer:

```
type LIKE 'installation%'
```

---

### **5.3 RLS for step_master**

Only Admin can modify.

---

### **5.4 RLS for lead_steps**

Users must match allowed_roles in the step.

This is dynamic.
You use a **Postgres function** that checks:

```
allowed_roles @> ARRAY[ current_user.role ]
```

Admin bypasses via:

```
role = 'admin' THEN TRUE
```

---

# ==========================================================

# **6. SUPABASE EDGE FUNCTIONS**

# ==========================================================

These serverless functions handle:

* Signed upload URL generation
* Step-level permission checks
* Linking customer → lead via phone
* Auto-creating leads on signup
* Document validation
* Auto-updating timeline

### Required Functions

1. **get-upload-url.ts**
2. **complete-step.ts**
3. **link-customer.ts**
4. **create-lead.ts**
5. **document-validation.ts**

All written in TypeScript and deployed to Supabase.

---

# =====================================================================

# **7. NEXT.JS FRONTEND ARCHITECTURE**

# =====================================================================

Use **Next.js App Router** with:

* Server Actions
* Route Handlers (`app/api/...`)
* Supabase client components
* Supabase server client for secure operations
* Using @supabase/auth-helpers-nextjs

---

# ==========================================================

# **8. NEXT.JS FOLDER STRUCTURE**

# ==========================================================

Recommended:

```
/app
   /admin
   /agent
   /office
   /installer
   /customer
   /lead/[id]
   /api
       /auth
       /leads
       /steps
       /documents
       /pmsuryaghar
/components
/lib
   supabaseClient.ts
   auth.ts
   roles.ts
/hooks
/styles
```

---

# ==========================================================

# **9. NEXT.JS ROUTE FLOW**

# ==========================================================

### 9.1 Login Route

`/login`

Uses Supabase Auth email/password or OTP.

---

### 9.2 Dashboard Routes (role-specific)

Admin → `/admin/dashboard`
Office → `/office/dashboard`
Agent → `/agent/dashboard`
Installer → `/installer/dashboard`
Customer → `/customer/dashboard`

---

### 9.3 Lead Detail Route

`/lead/[id]`

Components:

* Lead information
* Timeline view
* Document uploads
* PM Suryaghar form
* Activity log

Permissions enforced via server-side checks + RLS.

---

# ==========================================================

# **10. IMPLEMENTING TIMELINE IN NEXT.JS**

# ==========================================================

Timeline is powered by:

* `step_master`
* `lead_steps`

### Algorithm:

1. Fetch steps from `step_master` (ordered by index)
2. Fetch `lead_steps` for the lead
3. Merge both lists

### For each step:

```
status = completed | pending | upcoming
completed_at = timestamp
completed_by = user
remarks = text
attachments = documents
allowed_roles = array
```

### In UI:

* Completed steps → Green
* Pending (current) → Yellow
* Upcoming → Grey

If `step.customer_upload = true` → show upload button for customers.

---

# ==========================================================

# **11. SUPABASE FILE UPLOAD WITH NEXT.JS**

# ==========================================================

### Step 1: Customer/Agent/Office clicks "Upload"

Next.js calls:

```
POST /api/documents/upload-link
```

### Step 2: API Route calls Supabase Edge Function:

```
get-upload-url.ts
```

### Step 3: Supabase returns:

* signed URL
* file path

### Step 4: Next.js uploads file directly to signed URL:

```
await fetch(uploadUrl, { method: "PUT", body: file })
```

### Step 5: Backend stores file metadata in DB

---

# ==========================================================

# **12. CUSTOMER SIGNUP + LINK WITH LEAD**

# ==========================================================

### Flow:

1. Customer signs up → Supabase Auth
2. Edge Function checks:

```
SELECT * FROM leads WHERE phone = customer.phone
```

3. If exists → link lead.customer_id to new user
4. If not → create new lead with:

```
created_by = customer
source = "self"
status = "lead"
```

Customer sees timeline instantly.

---

# ==========================================================

# **13. STEP PERMISSION HANDLING IN NEXT.JS**

# ==========================================================

When user tries to mark a step complete:

1. Next.js calls:

```
POST /api/steps/{step_id}/complete
```

2. API route calls Supabase RPC function:

```
FUNCTION complete_step(lead_id, step_id, user_id)
```

3. RPC checks:

```
IF current_user.role IN allowed_roles OR role = 'admin':
    update lead_steps
ELSE:
    raise error
```

---

# ==========================================================

# **14. RECOMMENDED SUPABASE EXTENSIONS**

# ==========================================================

Install:

* `pgcrypto` (UUID)
* `pgjwt`
* `http` (for webhooks)
* `pg_stat_statements`

---

# ==========================================================

# **15. DEPLOYMENT STRATEGY**

# ==========================================================

### Frontend:

* Deploy Next.js to Vercel (recommended)
* Use Server Actions for backend logic

### Backend:

* Supabase handles:

  * Auth
  * DB
  * Storage
  * Edge Functions
  * Real-time events

---

# ==========================================================

# **16. FINAL END-TO-END FLOW**

# ==========================================================

```
User logs in (Supabase Auth)
    ↓
Dashboard based on role
    ↓
Lead creation (Agent/Admin/Customer)
    ↓
Document Upload (Signed URLs)
    ↓
PM Suryaghar form
    ↓
Lead status → Lead Processing
    ↓
Timeline steps executed (Office/Admin/Installer)
    ↓
Customer sees full progress
    ↓
Installation & subsidy complete
    ↓
Lead marked as Closed
```

---

# ==========================================================

# **17. READY FOR DEVELOPMENT**

# ==========================================================

This is your **final implementation blueprint** for:

* Supabase (backend)
* Next.js (frontend)
* Full CRM
* Full customer portal
* Full timeline workflow
* Secure document handling
* Role-based permissions
* End-to-end Solar lifecycle management




