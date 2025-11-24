# Requirements Document

## Introduction

The Solar CRM system is a comprehensive customer relationship management platform designed to manage the complete lifecycle of solar rooftop installation projects. The system tracks projects from initial lead generation through survey, proposal, payment/loan processing, installation, net metering, subsidy application, and final closure. It supports five distinct user roles (Admin, Agent, Office Team, Installer, and Customer) with role-based permissions, document management with secure storage, a dynamic timeline workflow engine, and a customer portal for self-service capabilities.

## Glossary

- **System**: The Solar CRM web application
- **Lead**: A potential or active solar installation project record
- **Timeline**: The sequential workflow of steps tracking a solar project from creation to closure
- **Step Master**: The admin-configurable template defining all possible timeline steps
- **PM Suryaghar Form**: A mandatory government form required for solar subsidy applications
- **Signed URL**: A time-limited, secure URL for direct file uploads to Supabase Storage
- **RLS**: Row-Level Security policies in Supabase PostgreSQL
- **Agent**: A user role responsible for generating and managing their own leads
- **Office Team**: A user role with access to all leads and administrative processing capabilities
- **Installer**: A user role focused on installation-related tasks and updates
- **Customer**: An end-user who can self-register, track their lead, and upload documents
- **Admin**: A superuser role with unrestricted access to all system functions
- **Lead Linking**: The process of connecting a customer account to an existing lead via phone number
- **Mandatory Documents**: Required files (Aadhar, Bijli Bill, Bank Passbook, Cancelled Cheque, PAN Card) for lead validation
- **Supabase**: The backend-as-a-service platform providing authentication, database, and storage

## Requirements

### Requirement 1: User Authentication and Account Management

**User Story:** As a system user, I want to securely authenticate and access role-appropriate features, so that I can perform my designated tasks within the system.

#### Acceptance Criteria

1. WHEN a user provides valid credentials THEN the System SHALL authenticate the user via Supabase Auth and establish a session
2. WHEN a user account is created THEN the System SHALL assign exactly one role from the set (Admin, Agent, Office Team, Installer, Customer)
3. WHEN a user logs in THEN the System SHALL redirect the user to a role-specific dashboard based on their assigned role
4. WHEN an Admin disables a user account THEN the System SHALL prevent that user from authenticating until re-enabled
5. THE System SHALL store user profile data including name, phone, email, role, and status in the users table

### Requirement 2: Lead Creation and Management

**User Story:** As an Agent, I want to create and manage leads for potential solar customers, so that I can track my sales pipeline.

#### Acceptance Criteria

1. WHEN an Agent creates a lead THEN the System SHALL record the lead with fields: name, phone, email, address, KW requirement, roof type, notes, and created_by reference
2. WHEN a lead is created THEN the System SHALL initialize the lead status as "Ongoing"
3. WHEN mandatory documents are uploaded AND PM Suryaghar form is submitted THEN the System SHALL automatically update lead status to "Interested"
4. WHEN an Agent views leads THEN the System SHALL display only leads where created_by matches the Agent's user ID
5. WHEN Office Team or Admin views leads THEN the System SHALL display all leads in the system

### Requirement 3: Customer Self-Registration and Lead Linking

**User Story:** As a Customer, I want to create an account and automatically link to my existing lead, so that I can track my solar installation progress.

#### Acceptance Criteria

1. WHEN a Customer registers with phone, email, name, and password THEN the System SHALL create a Supabase Auth account and user profile
2. WHEN a Customer account is created THEN the System SHALL query the leads table for an existing lead matching the Customer's phone number
3. IF a matching lead exists THEN the System SHALL link the Customer account to that lead by updating the lead's customer_account_id field
4. IF no matching lead exists THEN the System SHALL create a new lead with created_by set to the Customer's user ID and source set to "self"
5. WHEN a Customer logs in THEN the System SHALL display the linked lead's timeline and allow document uploads

### Requirement 4: Document Management with Secure Storage

**User Story:** As an Office Team member, I want to securely upload and manage project documents, so that all required files are properly stored and accessible.

#### Acceptance Criteria

1. WHEN a user requests to upload a document THEN the System SHALL generate a Supabase signed upload URL with expiration time
2. WHEN a document is uploaded THEN the System SHALL store the file in Supabase Storage under the path structure: leads/{lead_id}/{type}/{uuid}.{extension}
3. WHEN a document is uploaded THEN the System SHALL record metadata in the documents table including lead_id, type, file_path, uploaded_by, status, and uploaded_at
4. THE System SHALL enforce mandatory documents: Aadhar Front, Aadhar Back, Bijli Bill, Bank Passbook, Cancelled Cheque, and PAN Card
5. WHEN Admin or Office marks a document as corrupted THEN the System SHALL create a timeline step requiring Customer re-upload

### Requirement 5: PM Suryaghar Form Submission

**User Story:** As an Agent, I want to fill and submit the PM Suryaghar form for my leads, so that the project can proceed to the interested stage.

#### Acceptance Criteria

1. WHEN a user with appropriate permissions submits the PM Suryaghar form THEN the System SHALL store the form data as JSON in the pm_suryaghar_form table
2. WHEN the PM Suryaghar form is submitted THEN the System SHALL record the lead_id, submitted_by user ID, and submitted_at timestamp
3. WHEN the PM Suryaghar form is submitted AND all mandatory documents are uploaded THEN the System SHALL update the lead status to "Interested"
4. WHEN an Agent submits the form THEN the System SHALL allow submission only for leads where created_by matches the Agent's user ID
5. WHEN a Customer submits the form THEN the System SHALL allow submission only for leads linked to that Customer's account

### Requirement 6: Dynamic Timeline Workflow Engine

**User Story:** As an Admin, I want to configure and manage the timeline steps for solar projects, so that the workflow can be customized to business needs.

#### Acceptance Criteria

1. WHEN Admin creates a step in Step Master THEN the System SHALL store step_name, order_index, allowed_roles array, remarks_required flag, attachments_allowed flag, and customer_upload flag
2. WHEN Admin reorders steps THEN the System SHALL update the order_index values to reflect the new sequence
3. WHEN Admin deletes a step from Step Master THEN the System SHALL remove the step and update all affected lead timelines
4. WHEN a lead is created THEN the System SHALL initialize lead_steps records for all steps in Step Master with status "pending"
5. THE System SHALL enforce that only users with roles listed in a step's allowed_roles array can modify that step

### Requirement 7: Step Completion and Timeline Progression

**User Story:** As an Office Team member, I want to mark timeline steps as completed, so that the project progresses through the installation workflow.

#### Acceptance Criteria

1. WHEN a user marks a step complete THEN the System SHALL verify the user's role is in the step's allowed_roles array OR the user is Admin
2. WHEN a step is marked complete THEN the System SHALL update the lead_steps record with status "completed", completed_by user ID, completed_at timestamp, and optional remarks
3. IF a step requires attachments THEN the System SHALL prevent completion until at least one document is uploaded for that step
4. IF a step requires remarks THEN the System SHALL prevent completion until remarks text is provided
5. WHEN a step is completed THEN the System SHALL update the next step's status to "pending" if it was "upcoming"

### Requirement 8: Role-Based Permissions Enforcement

**User Story:** As a system administrator, I want role-based access controls enforced at the database level, so that users can only access data appropriate to their role.

#### Acceptance Criteria

1. WHEN an Agent queries leads THEN the System SHALL apply RLS policy restricting results to leads where created_by equals the Agent's user ID
2. WHEN a Customer queries leads THEN the System SHALL apply RLS policy restricting results to leads where customer_account_id equals the Customer's user ID
3. WHEN Office Team or Admin queries leads THEN the System SHALL apply RLS policy allowing access to all leads
4. WHEN an Installer queries leads THEN the System SHALL apply RLS policy restricting results to leads assigned for installation
5. WHEN any user attempts to modify Step Master THEN the System SHALL apply RLS policy allowing only Admin role

### Requirement 9: Customer Portal Timeline View

**User Story:** As a Customer, I want to view my project timeline with all steps and their status, so that I can track installation progress.

#### Acceptance Criteria

1. WHEN a Customer views their timeline THEN the System SHALL display all steps from Step Master in order_index sequence
2. WHEN displaying each step THEN the System SHALL show step name, status (completed/pending/upcoming), completed_at timestamp, completed_by name, and remarks
3. WHEN a step has customer_upload flag set to true AND status is pending THEN the System SHALL display an upload button for the Customer
4. WHEN a step is completed THEN the System SHALL display a green indicator and completion details
5. WHEN a step is pending THEN the System SHALL display a yellow indicator and allow Customer actions if customer_upload is true

### Requirement 10: Installer Assignment and Installation Tracking

**User Story:** As an Installer, I want to view assigned installation projects and update installation progress, so that I can complete my work efficiently.

#### Acceptance Criteria

1. WHEN Office Team assigns an Installer to a lead THEN the System SHALL record the installer_id in the lead record
2. WHEN an Installer logs in THEN the System SHALL display only leads where installer_id matches the Installer's user ID
3. WHEN an Installer uploads installation photos THEN the System SHALL store files under leads/{lead_id}/installation/ path
4. WHEN an Installer marks installation step complete THEN the System SHALL update the lead_steps record for the installation step
5. THE System SHALL prevent Installers from viewing PM Suryaghar form data, financial details, or survey information

### Requirement 11: Admin Override and Superuser Capabilities

**User Story:** As an Admin, I want unrestricted access to all system functions, so that I can manage exceptions and resolve issues.

#### Acceptance Criteria

1. WHEN Admin attempts any operation THEN the System SHALL bypass all role-based restrictions and RLS policies
2. WHEN Admin views any lead THEN the System SHALL display complete information including all documents, forms, and timeline history
3. WHEN Admin modifies a step THEN the System SHALL allow changes regardless of allowed_roles configuration
4. WHEN Admin marks a document as corrupted or valid THEN the System SHALL update the document status and trigger appropriate workflow actions
5. WHEN Admin moves timeline backward or skips steps THEN the System SHALL update lead_steps records accordingly without validation errors

### Requirement 12: Activity Logging and Audit Trail

**User Story:** As an Admin, I want to view a complete audit log of all system actions, so that I can track changes and investigate issues.

#### Acceptance Criteria

1. WHEN any user creates, updates, or deletes a lead THEN the System SHALL record an entry in activity_log with user_id, action, timestamp, and changed fields
2. WHEN any user uploads or deletes a document THEN the System SHALL record an entry in activity_log with document details
3. WHEN any user completes or reopens a timeline step THEN the System SHALL record an entry in activity_log with step details and status change
4. WHEN any user submits or modifies PM Suryaghar form THEN the System SHALL record an entry in activity_log with form submission details
5. WHEN Admin views activity log THEN the System SHALL display all entries with filtering options by lead, user, action type, and date range

### Requirement 13: Document Corruption Handling and Re-upload

**User Story:** As an Office Team member, I want to mark documents as corrupted and request re-upload, so that we maintain valid documentation.

#### Acceptance Criteria

1. WHEN Office Team or Admin marks a document as corrupted THEN the System SHALL update the document status field to "corrupted"
2. WHEN a document is marked corrupted THEN the System SHALL create a new timeline step or notification requiring re-upload
3. IF the corrupted document was uploaded by Customer THEN the System SHALL notify the Customer and display upload button in their portal
4. IF the corrupted document was uploaded by Agent THEN the System SHALL notify the Agent and allow re-upload
5. WHEN a replacement document is uploaded THEN the System SHALL update the original document record status to "replaced" and create new document record

### Requirement 14: Payment and Loan Workflow Tracking

**User Story:** As an Office Team member, I want to track payment status and loan processing, so that financial aspects of projects are properly managed.

#### Acceptance Criteria

1. WHEN Office Team marks payment received THEN the System SHALL update the corresponding timeline step to completed with payment details in remarks
2. WHEN Office Team selects loan option THEN the System SHALL create loan-specific timeline steps for loan application and approval
3. WHEN payment or loan step is completed THEN the System SHALL enable the installation scheduling step
4. THE System SHALL store payment amount, payment date, payment method, and transaction reference in the step remarks or dedicated fields
5. WHEN Customer views timeline THEN the System SHALL display payment status without exposing sensitive financial details

### Requirement 15: Net Metering and Subsidy Application

**User Story:** As an Office Team member, I want to track net metering application and subsidy submission, so that customers receive all entitled benefits.

#### Acceptance Criteria

1. WHEN installation is completed THEN the System SHALL enable the net meter application step
2. WHEN Office Team submits net meter application THEN the System SHALL update the timeline step with application reference number and submission date
3. WHEN commissioning is completed THEN the System SHALL enable the subsidy submission step
4. WHEN Office Team submits subsidy application THEN the System SHALL update the timeline step with subsidy amount and application details
5. WHEN subsidy is released THEN the System SHALL mark the subsidy step complete and enable project closure step

### Requirement 16: Project Closure and Completion

**User Story:** As an Office Team member, I want to mark projects as closed when all steps are completed, so that we can track successful installations.

#### Acceptance Criteria

1. WHEN all mandatory timeline steps are completed THEN the System SHALL enable the project closure step
2. WHEN Office Team or Admin marks project as closed THEN the System SHALL update lead status to "Closed"
3. WHEN a project is closed THEN the System SHALL record closure date, closed_by user ID, and final remarks
4. WHEN a project is closed THEN the System SHALL prevent further modifications to timeline steps unless reopened by Admin
5. WHEN Admin reopens a closed project THEN the System SHALL update lead status back to "Ongoing" and allow step modifications

### Requirement 17: Dashboard and Reporting

**User Story:** As an Office Team member, I want to view dashboards with key metrics and lead statistics, so that I can monitor business performance.

#### Acceptance Criteria

1. WHEN Office Team or Admin views dashboard THEN the System SHALL display total leads count, leads by status, and leads by current timeline step
2. WHEN Agent views dashboard THEN the System SHALL display statistics for only the Agent's own leads
3. WHEN dashboard is loaded THEN the System SHALL calculate and display conversion rates from Ongoing to Interested to Closed
4. WHEN dashboard is loaded THEN the System SHALL display pending actions count including incomplete steps and missing documents
5. THE System SHALL provide filtering options by date range, lead status, assigned user, and timeline step

### Requirement 18: Search and Filter Capabilities

**User Story:** As an Office Team member, I want to search and filter leads by various criteria, so that I can quickly find specific projects.

#### Acceptance Criteria

1. WHEN a user enters search text THEN the System SHALL query leads by name, phone, email, or address containing the search term
2. WHEN a user applies status filter THEN the System SHALL display only leads matching the selected status values
3. WHEN a user applies date range filter THEN the System SHALL display only leads created within the specified date range
4. WHEN a user applies timeline step filter THEN the System SHALL display only leads currently at the selected step
5. THE System SHALL support combining multiple filters with AND logic and display result count

### Requirement 19: Notification System

**User Story:** As a Customer, I want to receive notifications when my project timeline is updated, so that I stay informed of progress.

#### Acceptance Criteria

1. WHEN a timeline step is completed for a Customer's lead THEN the System SHALL create a notification record for that Customer
2. WHEN a document is marked corrupted THEN the System SHALL create a notification for the Customer requesting re-upload
3. WHEN Office Team adds remarks to a step THEN the System SHALL create a notification for the Customer with the remarks content
4. WHEN a Customer logs in THEN the System SHALL display unread notifications count and notification list
5. WHEN a Customer views a notification THEN the System SHALL mark the notification as read

### Requirement 20: Mobile Responsiveness

**User Story:** As a Customer, I want to access the portal from my mobile device, so that I can track my project on the go.

#### Acceptance Criteria

1. WHEN the System is accessed from a mobile device THEN the System SHALL render a responsive layout optimized for the device screen size
2. WHEN a Customer uploads documents from mobile THEN the System SHALL support camera capture and gallery selection
3. WHEN timeline is viewed on mobile THEN the System SHALL display steps in a vertically scrollable format with touch-friendly controls
4. WHEN forms are filled on mobile THEN the System SHALL provide appropriate input types and validation for mobile keyboards
5. THE System SHALL maintain full functionality across desktop, tablet, and mobile screen sizes
