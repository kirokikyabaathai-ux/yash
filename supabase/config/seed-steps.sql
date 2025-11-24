-- Seed Script for Step Master
-- This script creates the default timeline steps for the Solar CRM system
-- Requirements: 6.1

-- Clear existing steps (for re-seeding in development)
-- CAUTION: This will cascade delete all lead_steps records
-- Comment out in production if you want to preserve existing data
-- DELETE FROM step_master;

-- Insert default timeline steps in order
-- Each step includes:
--   - step_name: Display name of the step
--   - order_index: Sequential order (determines display order)
--   - allowed_roles: Array of roles that can complete this step
--   - remarks_required: Whether remarks are mandatory for completion
--   - attachments_allowed: Whether attachments can be added to this step
--   - customer_upload: Whether customers can upload documents for this step

-- Step 1: Lead Created
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Lead Created',
  1,
  ARRAY['admin', 'office', 'agent']::text[],
  false,
  false,
  false
);

-- Step 2: Initial Contact
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Initial Contact',
  2,
  ARRAY['admin', 'office', 'agent']::text[],
  true,
  false,
  false
);

-- Step 3: Site Survey
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Site Survey',
  3,
  ARRAY['admin', 'office', 'agent']::text[],
  true,
  true,
  false
);

-- Step 4: Document Collection
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Document Collection',
  4,
  ARRAY['admin', 'office', 'agent', 'customer']::text[],
  false,
  true,
  true
);

-- Step 5: PM Suryaghar Form Submission
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'PM Suryaghar Form Submission',
  5,
  ARRAY['admin', 'office', 'agent', 'customer']::text[],
  false,
  false,
  false
);

-- Step 6: Proposal Generation
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Proposal Generation',
  6,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 7: Proposal Approval
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Proposal Approval',
  7,
  ARRAY['admin', 'office', 'customer']::text[],
  true,
  true,
  true
);

-- Step 8: Payment/Loan Processing
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Payment/Loan Processing',
  8,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 9: Installer Assignment
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Installer Assignment',
  9,
  ARRAY['admin', 'office']::text[],
  true,
  false,
  false
);

-- Step 10: Installation Scheduling
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Installation Scheduling',
  10,
  ARRAY['admin', 'office', 'installer']::text[],
  true,
  false,
  false
);

-- Step 11: Installation in Progress
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Installation in Progress',
  11,
  ARRAY['admin', 'office', 'installer']::text[],
  true,
  true,
  false
);

-- Step 12: Installation Completed
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Installation Completed',
  12,
  ARRAY['admin', 'office', 'installer']::text[],
  true,
  true,
  false
);

-- Step 13: Quality Inspection
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Quality Inspection',
  13,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 14: Commissioning
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Commissioning',
  14,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 15: Net Meter Application
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Net Meter Application',
  15,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 16: Net Meter Installation
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Net Meter Installation',
  16,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 17: Subsidy Application
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Subsidy Application',
  17,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 18: Subsidy Approval
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Subsidy Approval',
  18,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 19: Subsidy Release
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Subsidy Release',
  19,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Step 20: Project Closure
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Project Closure',
  20,
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);

-- Verify the seed data
SELECT 
  step_name,
  order_index,
  allowed_roles,
  remarks_required,
  attachments_allowed,
  customer_upload
FROM step_master
ORDER BY order_index;

-- Display count
SELECT COUNT(*) as total_steps FROM step_master;
