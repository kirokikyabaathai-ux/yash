# Implementation Plan

## Architecture Overview

**IMPORTANT: Serverless Architecture with Anon Key Only**

This application follows a fully serverless architecture:
- **Frontend**: Next.js (Client Components, Server Components, API Routes) - Uses ONLY Supabase anon key
- **Backend**: Supabase (Auth, PostgreSQL with RLS, Storage, Edge Functions)

**Security Model:**
- All Next.js code (frontend and server-side) uses ONLY the Supabase anon key with user authentication sessions
- Service role key is NEVER used in the Next.js application
- Service role key is ONLY used in:
  1. Supabase Edge Functions (server-side, not exposed to browser)
  2. Tests (for setup/teardown)
- All permissions and data access are enforced by RLS policies at the database level
- The frontend cannot bypass RLS policies - security is database-enforced

**Key Points:**
- RLS policies enforce all authorization based on the authenticated user's role
- Next.js Server Components and API Routes use anon key + user session (RLS applies)
- Direct database queries from frontend are automatically filtered by RLS
- Edge Functions can use service role key for admin operations that need to bypass RLS

- [x] 1. Set up project structure and Supabase migration folders


  - Create supabase/ directory with subdirectories: models/, rpc/, storage/, edge-functions/, config/
  - Create models/ subdirectory with individual table files
  - Set up Supabase MCP connection for project "Solar"
  - _Requirements: All requirements (infrastructure)_

- [x] 2. Create database schema migrations





- [x] 2.1 Create users table migration


  - Write supabase/models/users.sql with users table schema
  - Include indexes for role and phone
  - _Requirements: 1.2, 1.5_

- [x] 2.2 Create leads table migration


  - Write supabase/models/leads.sql with leads table schema
  - Include indexes for created_by, customer_account_id, installer_id, status, phone
  - _Requirements: 2.1, 2.2, 3.3, 3.4_

- [x] 2.3 Create documents table migration


  - Write supabase/models/documents.sql with documents table schema
  - Include indexes for lead_id, type, status
  - _Requirements: 4.2, 4.3_

- [x] 2.4 Create step_master table migration


  - Write supabase/models/step_master.sql with step_master table schema
  - Include index for order_index
  - _Requirements: 6.1_

- [x] 2.5 Create lead_steps table migration


  - Write supabase/models/lead_steps.sql with lead_steps table schema
  - Include indexes for lead_id, step_id, status
  - Include unique constraint on (lead_id, step_id)
  - _Requirements: 6.4, 7.2_

- [x] 2.6 Create pm_suryaghar_form table migration


  - Write supabase/models/pm_suryaghar_form.sql with pm_suryaghar_form table schema
  - Include unique constraint on lead_id
  - _Requirements: 5.1, 5.2_

- [x] 2.7 Create activity_log table migration


  - Write supabase/models/activity_log.sql with activity_log table schema
  - Include indexes for lead_id, user_id, timestamp
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 2.8 Create notifications table migration


  - Write supabase/models/notifications.sql with notifications table schema
  - Include indexes for user_id, read, created_at
  - _Requirements: 19.1, 19.2, 19.3_

- [x] 2.9 Create all-schema.sql master file


  - Combine all table schemas into supabase/all-schema.sql
  - Add proper ordering for foreign key dependencies
  - _Requirements: All database requirements_


- [x] 3. Create Row-Level Security (RLS) policies





- [x] 3.1 Create RLS policies for leads table


  - Write supabase/config/rls-leads.sql with all RLS policies for leads
  - Include policies for Admin, Office, Agent, Customer, Installer roles
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3.2 Create RLS policies for documents table


  - Write supabase/config/rls-documents.sql with all RLS policies for documents
  - Include policies for all roles with appropriate restrictions
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3.3 Create RLS policies for step_master table


  - Write supabase/config/rls-step-master.sql with RLS policies
  - Allow read for all, modify for admin only
  - _Requirements: 8.5_

- [x] 3.4 Create RLS policies for other tables


  - Write supabase/config/rls-other.sql for lead_steps, pm_suryaghar_form, activity_log, notifications
  - Include appropriate role-based restrictions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3.5 Write property test for RLS policies



  - **Property 34: Agent RLS Lead Filtering**
  - **Property 35: Customer RLS Lead Filtering**
  - **Property 36: Office and Admin RLS Full Access**
  - **Property 37: Installer RLS Lead Filtering**
  - **Property 38: Step Master RLS Admin-Only Modification**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 4. Create Supabase Storage configuration




- [x] 4.1 Create storage bucket and policies


  - Write supabase/storage/bucket-config.sql to create solar-projects bucket
  - Set bucket to private
  - _Requirements: 4.1, 4.2_

- [x] 4.2 Create storage RLS policies


  - Write supabase/storage/storage-policies.sql with all storage RLS policies
  - Include policies for Admin, Office, Agent, Customer, Installer uploads
  - _Requirements: 4.1, 10.3_

- [x] 4.3 Write property test for storage path structure



  - **Property 15: Document Storage Path Structure**
  - **Property 44: Installer Upload Path Structure**
  - **Validates: Requirements 4.2, 10.3**

- [x] 5. Create Supabase RPC functions





- [x] 5.1 Create complete_step RPC function


  - Write supabase/rpc/complete_step.sql
  - Validate user permissions against allowed_roles
  - Update lead_steps with completion data
  - Progress timeline to next step
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 5.2 Create link_customer_to_lead RPC function


  - Write supabase/rpc/link_customer_to_lead.sql
  - Query leads by phone number
  - Link customer_account_id if match found
  - Create new lead if no match
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 5.3 Create check_mandatory_documents RPC



 function
  - Write supabase/rpc/check_mandatory_documents.sql
  - Validate all 6 mandatory documents are uploaded
  - Return validation result
  - _Requirements: 4.4_

- [x] 5.4 Create update_lead_status RPC function


  - Write supabase/rpc/update_lead_status.sql
  - Check if mandatory docs uploaded and PM form submitted
  - Auto-update status to "interested" if conditions met
  - _Requirements: 2.3, 5.3_

- [x] 5.5 Create initialize_lead_timeline RPC function


  - Write supabase/rpc/initialize_lead_timeline.sql
  - Create lead_steps records for all step_master steps
  - Set initial status to "pending"
  - _Requirements: 6.4_


- [x] 5.6 Write property tests for RPC functions



  - **Property 27: Timeline Initialization on Lead Creation**
  - **Property 28: Step Modification Permission Enforcement**
  - **Property 30: Step Completion Data Update**
  - **Property 33: Timeline Progression on Step Completion**
  - **Validates: Requirements 6.4, 6.5, 7.2, 7.5**
- [x] 6. Create Supabase Edge Functions




- [ ] 6. Create Supabase Edge Functions

- [x] 6.1 Create get-upload-url edge function


  - Write supabase/edge-functions/get-upload-url/index.ts
  - Generate signed upload URL with expiration
  - Validate user permissions for upload
  - Return uploadUrl and filePath
  - _Requirements: 4.1_

- [x] 6.2 Create document-validation edge function


  - Write supabase/edge-functions/document-validation/index.ts
  - Validate file type and size
  - Check mandatory document requirements
  - Trigger status update if all docs uploaded
  - _Requirements: 4.4, 2.3_

- [x] 6.3 Create activity-logger edge function


  - Write supabase/edge-functions/activity-logger/index.ts
  - Log all CRUD operations to activity_log
  - Include user_id, action, entity details
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 6.4 Write property tests for edge functions




  - **Property 14: Signed Upload URL Generation**
  - **Property 17: Mandatory Document Validation**
  - **Validates: Requirements 4.1, 4.4**

- [x] 7. Migrate all schemas to Supabase using MCP





  - Use Supabase MCP to apply all-schema.sql to project "Solar"
  - Apply RLS policies from config/ folder
  - Create storage bucket and policies
  - Deploy RPC functions
  - Deploy edge functions
  - _Requirements: All database and storage requirements_

- [x] 8. Set up Next.js project structure






  - Initialize Next.js 14+ with App Router and TypeScript
  - Install dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs
  - Install UI libraries: tailwindcss, shadcn/ui
  - Install form libraries: react-hook-form, zod
  - Install testing libraries: jest, @testing-library/react, fast-check
  - Create folder structure: app/, components/, lib/, hooks/, types/
  - _Requirements: All requirements (infrastructure)_

- [x] 9. Configure Supabase client





- [x] 9.1 Create Supabase client utilities


  - Write lib/supabase/client.ts for client-side Supabase client (uses anon key only)
  - Write lib/supabase/server.ts for server-side Supabase client (uses anon key with user session)
  - Write lib/supabase/middleware.ts for auth middleware
  - IMPORTANT: All frontend code (including Server Components and API Routes) uses ONLY the anon key
  - Service role key is NEVER used in the Next.js application
  - All permissions are enforced by RLS policies at the database level
  - _Requirements: 1.1_

- [x] 9.2 Create TypeScript types from database schema


  - Generate types from Supabase schema
  - Write types/database.ts with all table interfaces
  - Write types/api.ts with API request/response types
  - _Requirements: All requirements_

- [x] 9.3 Write unit tests for Supabase client utilities



  - Test client initialization
  - Test auth token handling
  - Test error handling
  - _Requirements: 1.1_

- [x] 10. Implement authentication module





- [x] 10.1 Create authentication components


  - Write components/auth/LoginForm.tsx
  - Write components/auth/SignupForm.tsx (for customers)
  - Write components/auth/AuthProvider.tsx for auth context
  - _Requirements: 1.1, 3.1_

- [x] 10.2 Create authentication API routes


  - Write app/api/auth/login/route.ts
  - Write app/api/auth/signup/route.ts
  - Write app/api/auth/logout/route.ts
  - Integrate with Supabase Auth
  - _Requirements: 1.1, 3.1_

- [x] 10.3 Create auth middleware for route protection


  - Write middleware.ts for Next.js middleware
  - Check authentication status
  - Redirect based on user role
  - _Requirements: 1.3_


- [x] 10.4 Write property tests for authentication



  - **Property 1: Authentication Session Creation**
  - **Property 2: Role Assignment Uniqueness**
  - **Property 3: Role-Based Dashboard Routing**
  - **Property 4: Disabled Account Authentication Block**
  - **Property 5: User Profile Data Persistence**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 11. Implement lead management module





- [x] 11.1 Create lead data access layer


  - Write lib/api/leads.ts with CRUD functions
  - Implement createLead, getLead, updateLead, deleteLead
  - Implement getLeads with filtering and pagination
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 11.2 Create lead components


  - Write components/leads/LeadList.tsx
  - Write components/leads/LeadDetail.tsx
  - Write components/leads/LeadForm.tsx
  - Write components/leads/LeadStatusBadge.tsx
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 11.3 Create lead API routes


  - Write app/api/leads/route.ts (GET, POST)
  - Write app/api/leads/[id]/route.ts (GET, PATCH, DELETE)
  - Implement role-based filtering
  - _Requirements: 2.1, 2.4, 2.5_

- [ ]* 11.4 Write property tests for lead management
  - **Property 6: Lead Creation Data Integrity**
  - **Property 7: Initial Lead Status**
  - **Property 9: Agent Lead Visibility Restriction**
  - **Property 10: Office and Admin Full Lead Access**
  - **Validates: Requirements 2.1, 2.2, 2.4, 2.5**
-

- [x] 12. Implement customer registration and lead linking



- [x] 12.1 Create customer registration flow


  - Write components/auth/CustomerSignupForm.tsx
  - Implement phone number validation
  - Call link_customer_to_lead RPC after registration
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 12.2 Create customer dashboard


  - Write app/customer/dashboard/page.tsx
  - Display linked lead information
  - Show timeline and document upload options
  - _Requirements: 3.5_

- [x] 12.3 Write property tests for customer linking



  - **Property 11: Customer Account and Profile Creation**
  - **Property 12: Lead Linking on Match**
  - **Property 13: Automatic Lead Creation for New Customers**
  - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 13. Implement document management module



- [x] 13.1 Create document upload components


  - Write components/documents/DocumentUploader.tsx with drag-and-drop
  - Write components/documents/DocumentList.tsx
  - Write components/documents/DocumentViewer.tsx
  - Write components/documents/DocumentStatusBadge.tsx
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 13.2 Create document API routes


  - Write app/api/leads/[id]/documents/route.ts (GET, POST)
  - Write app/api/leads/[id]/documents/upload-url/route.ts (POST)
  - Integrate with get-upload-url edge function
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 13.3 Implement document upload flow


  - Request signed URL from API
  - Upload file directly to Supabase Storage
  - Record document metadata in database
  - Trigger validation check
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 13.4 Implement document corruption handling


  - Create API route for marking documents as corrupted
  - Trigger notification creation
  - Display re-upload UI for affected users
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 13.5 Write property tests for document management






  - **Property 14: Signed Upload URL Generation**
  - **Property 15: Document Storage Path Structure**
  - **Property 16: Document Metadata Persistence**
  - **Property 17: Mandatory Document Validation**
  - **Property 18: Corrupted Document Workflow Trigger**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 14. Implement PM Suryaghar form module




- [ ] 14. Implement PM Suryaghar form module

- [x] 14.1 Create PM Suryaghar form components


  - Write components/forms/PMSuryagharForm.tsx as multi-step form
  - Write components/forms/FormSection.tsx for reusable sections
  - Write components/forms/FormProgress.tsx for progress indicator
  - Implement form validation with Zod
  - _Requirements: 5.1, 5.2_

- [x] 14.2 Create PM Suryaghar API routes


  - Write app/api/leads/[id]/pm-suryaghar/route.ts (GET, POST, PATCH)
  - Validate user permissions (Agent for own leads, Customer for linked lead, Office/Admin for all)
  - Store form data as JSON
  - Trigger status update if conditions met
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 14.3 Write property tests for PM Suryaghar form

  - **Property 19: PM Suryaghar Form Data Persistence**
  - **Property 20: Form Submission Metadata Recording**
  - **Property 21: Combined Status Transition**
  - **Property 22: Agent Form Submission Permission**
  - **Property 23: Customer Form Submission Permission**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
-

- [x] 15. Implement timeline workflow engine




- [x] 15.1 Create Step Master admin interface


  - Write app/admin/steps/page.tsx for step management
  - Write components/admin/StepMasterList.tsx
  - Write components/admin/StepMasterForm.tsx
  - Implement drag-and-drop reordering
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 15.2 Create Step Master API routes


  - Write app/api/steps/route.ts (GET, POST)
  - Write app/api/steps/[id]/route.ts (PATCH, DELETE)
  - Write app/api/steps/reorder/route.ts (PUT)
  - Restrict to admin role only
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 15.3 Create timeline display components


  - Write components/timeline/Timeline.tsx
  - Write components/timeline/TimelineStep.tsx
  - Write components/timeline/StepCompletionModal.tsx
  - Display steps in order with status indicators
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 15.4 Create timeline API routes


  - Write app/api/leads/[id]/steps/route.ts (GET)
  - Write app/api/leads/[id]/steps/[stepId]/complete/route.ts (POST)
  - Write app/api/leads/[id]/steps/[stepId]/reopen/route.ts (POST)
  - Call complete_step RPC function
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15.5 Write property tests for timeline engine



  - **Property 24: Step Master Data Integrity**
  - **Property 25: Step Reordering Consistency**
  - **Property 26: Step Deletion Cascade**
  - **Property 27: Timeline Initialization on Lead Creation**
  - **Property 28: Step Modification Permission Enforcement**
  - **Property 29: Step Completion Permission Validation**
  - **Property 30: Step Completion Data Update**
  - **Property 31: Attachment Requirement Validation**
  - **Property 32: Remarks Requirement Validation**
  - **Property 33: Timeline Progression on Step Completion**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5**
-

- [ ] 16. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Implement role-specific dashboards





- [x] 17.1 Create Admin dashboard


  - Write app/admin/dashboard/page.tsx
  - Display all leads, metrics, and system health
  - Include user management interface
  - _Requirements: 17.1, 17.3, 17.4, 17.5_

- [x] 17.2 Create Office dashboard


  - Write app/office/dashboard/page.tsx
  - Display all leads with filtering
  - Show pending actions and metrics
  - _Requirements: 17.1, 17.3, 17.4, 17.5_

- [x] 17.3 Create Agent dashboard


  - Write app/agent/dashboard/page.tsx
  - Display only agent's own leads
  - Show agent-specific metrics
  - _Requirements: 17.2, 17.3, 17.4, 17.5_

- [x] 17.4 Create Installer dashboard


  - Write app/installer/dashboard/page.tsx
  - Display assigned installation leads
  - Show installation tasks
  - _Requirements: 10.2_

- [x] 17.5 Create Customer dashboard


  - Write app/customer/dashboard/page.tsx
  - Display linked lead timeline
  - Show notifications and pending actions
  - _Requirements: 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 17.6 Create dashboard metrics API


  - Write app/api/dashboard/metrics/route.ts
  - Calculate total leads, leads by status, leads by step
  - Calculate conversion rates
  - Calculate pending actions count
  - Filter by user role
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 17.7 Write property tests for dashboard metrics



  - **Property 77: Dashboard Metrics Calculation**
  - **Property 78: Agent Dashboard Filtering**
  - **Property 79: Conversion Rate Calculation**
  - **Property 80: Pending Actions Count**
  - **Property 81: Dashboard Filter Functionality**
  - **Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**

- [x] 18. Implement search and filter functionality




- [x] 18.1 Create search and filter components


  - Write components/leads/SearchBar.tsx
  - Write components/leads/FilterPanel.tsx
  - Implement multi-field search
  - Implement status, date range, and step filters
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 18.2 Enhance leads API with search and filters


  - Update app/api/leads/route.ts to support query parameters
  - Implement search across name, phone, email, address
  - Implement filter by status, date range, timeline step
  - Support combining multiple filters with AND logic
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_


- [x] 18.3 Write property tests for search and filter



  - **Property 82: Multi-Field Search**
  - **Property 83: Status Filter Application**
  - **Property 84: Date Range Filter Application**
  - **Property 85: Timeline Step Filter Application**
  - **Property 86: Combined Filter Logic**
  - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**

- [x] 19. Implement notification system





- [x] 19.1 Create notification components


  - Write components/notifications/NotificationBell.tsx
  - Write components/notifications/NotificationList.tsx
  - Write components/notifications/NotificationItem.tsx
  - Display unread count badge
  - _Requirements: 19.4_

- [x] 19.2 Create notification API routes


  - Write app/api/notifications/route.ts (GET)
  - Write app/api/notifications/[id]/read/route.ts (PATCH)
  - Filter notifications by user_id
  - _Requirements: 19.4, 19.5_

- [x] 19.3 Implement notification triggers


  - Create database triggers or edge functions for notification creation
  - Trigger on step completion
  - Trigger on document corruption
  - Trigger on remarks addition
  - _Requirements: 19.1, 19.2, 19.3_

- [x] 19.4 Write property tests for notifications



  - **Property 87: Step Completion Notification Creation**
  - **Property 88: Document Corruption Notification Creation**
  - **Property 89: Remarks Notification Creation**
  - **Property 90: Notification Display on Login**
  - **Property 91: Notification Read Status Update**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5**
-

- [ ] 20. Implement activity logging


- [x] 20.1 Create activity logging middleware


  - Write lib/middleware/activity-logger.ts
  - Log all CRUD operations
  - Include user_id, action, entity details, old/new values
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 20.2 Create activity log viewer


  - Write app/admin/activity-log/page.tsx
  - Write components/admin/ActivityLogList.tsx
  - Implement filtering by lead, user, action type, date range
  - _Requirements: 12.5_

- [x] 20.3 Create activity log API


  - Write app/api/leads/[id]/activity/route.ts (GET)
  - Support filtering and pagination
  - Restrict to admin and office roles
  - _Requirements: 12.5_

- [ ]* 20.4 Write property tests for activity logging


  - **Property 52: Lead Operation Activity Logging**
  - **Property 53: Document Operation Activity Logging**
  - **Property 54: Step Operation Activity Logging**
  - **Property 55: Form Operation Activity Logging**
  - **Property 56: Activity Log Filtering**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**


- [-] 21. Implement installer module






- [x] 21.1 Create installer assignment interface


  - Write components/office/InstallerAssignment.tsx
  - Allow office team to assign installers to leads
  - Update lead.installer_id field
  - _Requirements: 10.1_

- [x] 21.2 Create installer upload interface


  - Write components/installer/InstallationPhotoUploader.tsx
  - Allow installers to upload installation photos
  - Store files under leads/{lead_id}/installation/ path
  - _Requirements: 10.3_

- [x] 21.3 Implement installer data access restrictions


  - Ensure installers cannot access PM Suryaghar form
  - Ensure installers cannot access financial details
  - Ensure installers cannot access survey information
  - _Requirements: 10.5_

- [-] 21.4 Write property tests for installer module



  - **Property 42: Installer Assignment Recording**
  - **Property 43: Installer Lead Visibility**
  - **Property 44: Installer Upload Path Structure**
  - **Property 45: Installer Step Completion**
  - **Property 46: Installer Data Access Restriction**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 22. Implement admin override capabilities

- [x] 22.1 Create admin override UI





  - Write components/admin/AdminOverride.tsx
  - Allow admin to bypass all restrictions
  - Allow admin to move timeline backward/forward
  - Allow admin to skip steps
  - _Requirements: 11.1, 11.5_

- [x] 22.2 Implement admin document management



  - Allow admin to mark documents as corrupted or valid
  - Trigger appropriate workflow actions
  - _Requirements: 11.4_

- [x] 22.3 Write property tests for admin capabilities




  - **Property 47: Admin Permission Bypass**
  - **Property 48: Admin Complete Data Access**
  - **Property 49: Admin Step Modification Override**
  - **Property 50: Admin Document Status Management**
  - **Property 51: Admin Timeline Manipulation Freedom**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**
-

- [x] 23. Implement payment and loan workflow




- [x] 23.1 Create payment tracking components


  - Write components/office/PaymentForm.tsx
  - Allow office team to mark payment received
  - Store payment details in step remarks
  - _Requirements: 14.1, 14.4_

- [x] 23.2 Create loan workflow components


  - Write components/office/LoanWorkflow.tsx
  - Create loan-specific timeline steps dynamically
  - Track loan application and approval
  - _Requirements: 14.2_

- [x] 23.3 Implement payment step dependencies


  - Enable installation scheduling after payment/loan completion
  - Mask sensitive financial details for customers
  - _Requirements: 14.3, 14.5_

- [x] 23.4 Write property tests for payment workflow



  - **Property 62: Payment Step Completion**
  - **Property 63: Loan Step Creation**
  - **Property 64: Installation Step Enablement After Payment**
  - **Property 65: Payment Data Persistence**
  - **Property 66: Payment Status Display Without Sensitive Data**
  - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

- [x] 24. Implement net metering and subsidy workflow




- [x] 24.1 Create net metering components


  - Write components/office/NetMeterForm.tsx
  - Enable net meter step after installation completion
  - Store application reference and submission date
  - _Requirements: 15.1, 15.2_

- [x] 24.2 Create subsidy application components


  - Write components/office/SubsidyForm.tsx
  - Enable subsidy step after commissioning
  - Store subsidy amount and application details
  - _Requirements: 15.3, 15.4_

- [x] 24.3 Implement subsidy completion workflow


  - Mark subsidy step complete on release
  - Enable project closure step
  - _Requirements: 15.5_

- [x] 24.4 Write property tests for net metering and subsidy



  - **Property 67: Net Meter Step Enablement**
  - **Property 68: Net Meter Application Data Recording**
  - **Property 69: Subsidy Step Enablement**
  - **Property 70: Subsidy Application Data Recording**
  - **Property 71: Project Closure Enablement After Subsidy**
  - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**


- [x] 25. Implement project closure workflow




- [x] 25.1 Create project closure components


  - Write components/office/ProjectClosureForm.tsx
  - Enable closure step when all mandatory steps completed
  - Record closure date, closed_by, and final remarks
  - _Requirements: 16.1, 16.2, 16.3_



- [ ] 25.2 Implement closed project restrictions
  - Prevent timeline modifications on closed projects
  - Display read-only view for closed projects


  - _Requirements: 16.4_

- [ ] 25.3 Implement project reopening
  - Allow admin to reopen closed projects


  - Update status back to "Ongoing"
  - Re-enable step modifications
  - _Requirements: 16.5_

- [ ] 25.4 Write property tests for project closure






  - **Property 72: Closure Step Enablement Logic**
  - **Property 73: Lead Status Update on Closure**
  - **Property 74: Closure Metadata Recording**
  - **Property 75: Closed Project Immutability**
  - **Property 76: Project Reopening**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

- [ ] 26. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 27. Implement mobile responsiveness





- [x] 27.1 Add responsive design to all components


  - Use Tailwind CSS responsive utilities
  - Test on mobile, tablet, and desktop viewports
  - Implement mobile-first approach
  - _Requirements: 20.1, 20.3_

- [x] 27.2 Implement mobile document upload


  - Support camera capture for document uploads
  - Support gallery selection
  - Optimize upload UI for mobile
  - _Requirements: 20.2_

- [x] 27.3 Optimize forms for mobile


  - Use appropriate input types for mobile keyboards
  - Implement touch-friendly controls
  - Add mobile-specific validation
  - _Requirements: 20.4_
-

- [x] 28. Implement error handling and validation




- [x] 28.1 Create error handling utilities


  - Write lib/errors/error-handler.ts
  - Implement consistent error response format
  - Add error logging to activity_log
  - Create user-friendly error messages

- [x] 28.2 Add form validation


  - Implement Zod schemas for all forms
  - Add client-side validation
  - Add server-side validation
  - Display validation errors clearly

- [x] 28.3 Add API error handling


  - Handle authentication errors (401, 403)
  - Handle validation errors (400, 422)
  - Handle not found errors (404)
  - Handle server errors (500, 503)

- [x] 28.4 Write unit tests for error handling








  - Test error response formatting
  - Test validation error handling
  - Test API error handling

- [x] 29. Implement user management (Admin)



- [x] 29.1 Create user management interface


  - Write app/admin/users/page.tsx
  - Write components/admin/UserList.tsx
  - Write components/admin/UserForm.tsx
  - Allow admin to create, edit, disable users
  - _Requirements: 1.2, 1.4_

- [x] 29.2 Create user management API


  - Write app/api/users/route.ts (GET, POST)
  - Write app/api/users/[id]/route.ts (GET, PATCH, DELETE)
  - Restrict to admin role only
  - _Requirements: 1.2, 1.4_

- [x] 29.3 Write property tests for user management



  - **Property 2: Role Assignment Uniqueness**
  - **Property 4: Disabled Account Authentication Block**
  - **Property 5: User Profile Data Persistence**
  - **Validates: Requirements 1.2, 1.4, 1.5**
-

- [x] 30. Implement initial data seeding



- [x] 30.1 Create seed script for step_master


  - Write supabase/config/seed-steps.sql
  - Add default timeline steps (Lead Created, PM Suryaghar Submitted, etc.)
  - Set appropriate allowed_roles for each step
  - _Requirements: 6.1_

- [x] 30.2 Create seed script for admin user


  - Write supabase/config/seed-admin.sql
  - Create initial admin account
  - _Requirements: 1.2_


- [x] 31. Implement UI polish and user experience





- [x] 31.1 Add loading states


  - Implement skeleton loaders for data fetching
  - Add loading spinners for actions
  - Show progress indicators for uploads

- [x] 31.2 Add success and error notifications


  - Implement toast notifications using shadcn/ui
  - Show success messages for completed actions
  - Show error messages for failed actions

- [x] 31.3 Add confirmation dialogs


  - Add confirmation for destructive actions (delete, close project)
  - Add confirmation for status changes
  - Add confirmation for document corruption marking

- [x] 31.4 Improve accessibility


  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works
  - Test with screen readers
  - Ensure color contrast meets WCAG standards

- [ ] 32. Set up environment configuration
- [ ] 32.1 Create environment variable files
  - Create .env.local.example with all required variables
  - Document Supabase URL, anon key, service role key
  - Document Next.js public variables
  - Add .env.local to .gitignore

- [ ] 32.2 Configure Supabase connection
  - Set NEXT_PUBLIC_SUPABASE_URL
  - Set NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Set SUPABASE_SERVICE_ROLE_KEY (for server-side operations)

- [ ] 32.3 Configure deployment settings
  - Set up Vercel project
  - Configure environment variables in Vercel
  - Set up automatic deployments from main branch

- [ ] 33. Write documentation
- [ ] 33.1 Create README.md
  - Document project setup instructions
  - Document environment variable configuration
  - Document database migration process
  - Document deployment process

- [ ] 33.2 Create API documentation
  - Document all API routes
  - Document request/response formats
  - Document authentication requirements
  - Document error responses

- [ ] 33.3 Create user guides
  - Write guide for Admin users
  - Write guide for Office Team users
  - Write guide for Agent users
  - Write guide for Installer users
  - Write guide for Customer users

- [ ] 34. Final testing and quality assurance
- [ ]* 34.1 Run all property-based tests
  - Execute all property tests with 100+ iterations
  - Verify all properties pass
  - Fix any failing properties

- [ ]* 34.2 Run integration tests
  - Test complete user workflows
  - Test role-based access control
  - Test document upload and management
  - Test timeline progression

- [ ]* 34.3 Perform manual testing
  - Test all user roles and permissions
  - Test on different browsers (Chrome, Firefox, Safari)
  - Test on different devices (desktop, tablet, mobile)
  - Test edge cases and error scenarios

- [ ] 34.4 Performance testing
  - Test page load times
  - Test API response times
  - Test with large datasets
  - Optimize slow queries

- [ ] 34.5 Security audit
  - Verify RLS policies are working correctly
  - Test authentication and authorization
  - Check for SQL injection vulnerabilities
  - Check for XSS vulnerabilities
  - Verify file upload security

- [ ] 35. Deployment preparation
- [ ] 35.1 Run database migrations on production
  - Apply all-schema.sql to production Supabase project
  - Apply RLS policies
  - Create storage bucket and policies
  - Deploy RPC functions
  - Deploy edge functions

- [ ] 35.2 Seed production data
  - Run seed-steps.sql to create default timeline steps
  - Run seed-admin.sql to create admin account
  - Verify data integrity

- [ ] 35.3 Deploy Next.js application
  - Deploy to Vercel production
  - Verify environment variables
  - Test production deployment
  - Monitor for errors

- [ ] 36. Post-deployment monitoring
- [ ] 36.1 Set up monitoring
  - Configure Vercel Analytics
  - Set up error tracking (Sentry or similar)
  - Monitor Supabase dashboard for performance
  - Set up alerts for critical errors

- [ ] 36.2 Monitor initial usage
  - Track user registrations
  - Monitor API performance
  - Check for errors in logs
  - Gather user feedback

- [ ] 36.3 Create maintenance plan
  - Document backup procedures
  - Document rollback procedures
  - Document incident response process
  - Schedule regular security audits

