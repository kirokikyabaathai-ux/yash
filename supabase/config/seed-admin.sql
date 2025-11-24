-- Seed Script for Admin User
-- This script creates the initial admin account for the Solar CRM system
-- Requirements: 1.2

-- IMPORTANT: This script assumes you have already created the admin user in Supabase Auth
-- You need to:
-- 1. Create the admin user via Supabase Dashboard or Auth API
-- 2. Get the user's UUID from Supabase Auth
-- 3. Replace the UUID below with the actual admin user UUID

-- Option 1: If you know the admin user's UUID from Supabase Auth
-- Replace 'YOUR_ADMIN_USER_UUID_HERE' with the actual UUID
-- Example: '550e8400-e29b-41d4-a716-446655440000'

-- Insert admin user profile
-- Note: The id must match the UUID from Supabase Auth
INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  status,
  assigned_area
)
VALUES (
  '4f585c02-1b1a-4c8a-b13e-9e36cac2afbb'::uuid,  -- Replace with actual admin UUID from Supabase Auth
  'admin@solarcrm.com',                -- Admin email
  'System Administrator',              -- Admin name
  '+919999999999',                     -- Admin phone (update as needed)
  'admin',                             -- Role
  'active',                            -- Status
  NULL                                 -- No assigned area for admin
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Option 2: If you want to create multiple admin users
-- Uncomment and modify the following as needed:

/*
INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  status,
  assigned_area
)
VALUES 
  (
    'ADMIN_UUID_1'::uuid,
    'admin1@solarcrm.com',
    'Admin User 1',
    '+919999999991',
    'admin',
    'active',
    NULL
  ),
  (
    'ADMIN_UUID_2'::uuid,
    'admin2@solarcrm.com',
    'Admin User 2',
    '+919999999992',
    'admin',
    'active',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
*/

-- Verify the admin user was created
SELECT 
  id,
  email,
  name,
  phone,
  role,
  status,
  created_at
FROM users
WHERE role = 'admin';

-- Display count of admin users
SELECT COUNT(*) as total_admin_users 
FROM users 
WHERE role = 'admin';

-- INSTRUCTIONS FOR DEPLOYMENT:
-- 
-- 1. Create Admin User in Supabase Auth:
--    - Go to Supabase Dashboard > Authentication > Users
--    - Click "Add User" or use the Auth API
--    - Create user with email: admin@solarcrm.com
--    - Set a strong password
--    - Copy the generated UUID
--
-- 2. Update This Script:
--    - Replace 'YOUR_ADMIN_USER_UUID_HERE' with the copied UUID
--    - Update email, name, and phone as needed
--
-- 3. Run This Script:
--    - Using Supabase CLI: supabase db push
--    - Using psql: psql -h your-db-host -U postgres -d postgres -f supabase/config/seed-admin.sql
--    - Using Supabase Dashboard: Copy and paste in SQL Editor
--
-- 4. Verify:
--    - Check that the admin user appears in the users table
--    - Test login with the admin credentials
--    - Verify admin has full access to all features
--
-- SECURITY NOTES:
-- - Change the default password immediately after first login
-- - Use a strong, unique password for the admin account
-- - Consider enabling 2FA for admin accounts
-- - Limit the number of admin users to only those who need full access
-- - Regularly audit admin user activity via the activity_log table
