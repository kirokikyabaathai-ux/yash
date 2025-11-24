# Seed Scripts Summary

This document provides an overview of the seed data scripts created for the Solar CRM system.

## Overview

Two seed scripts have been created to initialize the Solar CRM system with essential data:

1. **seed-steps.sql** - Creates default timeline steps
2. **seed-admin.sql** - Creates the initial admin user profile

## seed-steps.sql

### Purpose
Creates 20 default timeline steps that define the complete solar installation workflow from lead creation to project closure.

### Requirements Addressed
- **Requirement 6.1**: Step Master configuration and management

### Timeline Steps Created

| Order | Step Name | Allowed Roles | Remarks Required | Attachments | Customer Upload |
|-------|-----------|---------------|------------------|-------------|-----------------|
| 1 | Lead Created | admin, office, agent | No | No | No |
| 2 | Initial Contact | admin, office, agent | Yes | No | No |
| 3 | Site Survey | admin, office, agent | Yes | Yes | No |
| 4 | Document Collection | admin, office, agent, customer | No | Yes | Yes |
| 5 | PM Suryaghar Form Submission | admin, office, agent, customer | No | No | No |
| 6 | Proposal Generation | admin, office | Yes | Yes | No |
| 7 | Proposal Approval | admin, office, customer | Yes | Yes | Yes |
| 8 | Payment/Loan Processing | admin, office | Yes | Yes | No |
| 9 | Installer Assignment | admin, office | Yes | No | No |
| 10 | Installation Scheduling | admin, office, installer | Yes | No | No |
| 11 | Installation in Progress | admin, office, installer | Yes | Yes | No |
| 12 | Installation Completed | admin, office, installer | Yes | Yes | No |
| 13 | Quality Inspection | admin, office | Yes | Yes | No |
| 14 | Commissioning | admin, office | Yes | Yes | No |
| 15 | Net Meter Application | admin, office | Yes | Yes | No |
| 16 | Net Meter Installation | admin, office | Yes | Yes | No |
| 17 | Subsidy Application | admin, office | Yes | Yes | No |
| 18 | Subsidy Approval | admin, office | Yes | Yes | No |
| 19 | Subsidy Release | admin, office | Yes | Yes | No |
| 20 | Project Closure | admin, office | Yes | Yes | No |

### Key Features

**Role-Based Access:**
- Admin and Office roles have access to most steps
- Agents can handle initial stages (lead creation, contact, survey, documents, PM form)
- Customers can participate in document collection, PM form, and proposal approval
- Installers handle installation-related steps (scheduling, in progress, completed)

**Workflow Progression:**
- Steps are ordered sequentially (order_index 1-20)
- Each step has specific role permissions
- Some steps require remarks for completion
- Some steps allow document attachments
- Customer upload flag enables self-service document submission

**Business Logic:**
- Document Collection (Step 4) allows customer uploads for self-service
- PM Suryaghar Form (Step 5) is a critical milestone for status transition
- Proposal Approval (Step 7) involves customer participation
- Installation steps (10-12) are installer-focused
- Net metering and subsidy steps (15-19) follow installation
- Project Closure (Step 20) is the final step

### Usage

When a new lead is created, the system automatically initializes lead_steps records for all 20 steps with status "pending". This provides a complete project timeline from the start.

## seed-admin.sql

### Purpose
Creates the initial admin user profile in the users table, linking to a Supabase Auth account.

### Requirements Addressed
- **Requirement 1.2**: User role assignment and management

### Admin User Configuration

**Default Values:**
- **Email:** `admin@solarcrm.com` (customizable)
- **Name:** `System Administrator` (customizable)
- **Phone:** `+919999999999` (customizable)
- **Role:** `admin` (fixed)
- **Status:** `active` (fixed)
- **Assigned Area:** `NULL` (admin has no area restriction)

### Key Features

**UUID Synchronization:**
- The admin user must first be created in Supabase Auth
- The UUID from Supabase Auth must be used in this script
- This ensures the user profile links correctly to the authentication system

**Conflict Handling:**
- Uses `ON CONFLICT DO UPDATE` to allow re-running the script
- Updates existing admin user if already present
- Safe for development re-seeding

**Security Considerations:**
- Placeholder UUID must be replaced before deployment
- Strong password should be set in Supabase Auth
- Default password should be changed immediately after first login
- 2FA should be enabled for admin accounts

### Usage

1. Create admin user in Supabase Auth first
2. Copy the generated UUID
3. Update the script with the UUID
4. Run the script to create the user profile
5. Test login with admin credentials

## Deployment Order

For a fresh Solar CRM installation:

1. **Database Schema** - Apply `supabase/all-schema.sql`
2. **RLS Policies** - Apply all `rls-*.sql` files
3. **Timeline Steps** - Run `seed-steps.sql`
4. **Admin User** - Create in Auth, then run `seed-admin.sql`
5. **Triggers** - Apply `notification-triggers.sql`
6. **Verification** - Test admin login and step master display

## Verification Queries

### Verify Timeline Steps

```sql
-- Check total steps
SELECT COUNT(*) as total_steps FROM step_master;
-- Expected: 20

-- View all steps
SELECT step_name, order_index, allowed_roles 
FROM step_master 
ORDER BY order_index;

-- Check customer-facing steps
SELECT step_name, order_index 
FROM step_master 
WHERE customer_upload = true;
-- Expected: Document Collection, Proposal Approval
```

### Verify Admin User

```sql
-- Check admin user exists
SELECT id, email, name, role, status 
FROM users 
WHERE role = 'admin';
-- Expected: 1 row with admin details

-- Verify UUID matches Auth
SELECT id FROM users WHERE email = 'admin@solarcrm.com';
-- Compare with Supabase Auth user UUID
```

## Customization

### Adding Custom Steps

To add custom steps to the workflow:

1. Determine the appropriate order_index
2. Add INSERT statement to seed-steps.sql
3. Configure allowed_roles based on who should complete the step
4. Set remarks_required if documentation is needed
5. Set attachments_allowed if files should be attached
6. Set customer_upload if customers should upload documents

Example:
```sql
INSERT INTO step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed, customer_upload)
VALUES (
  'Custom Step Name',
  21,  -- After Project Closure
  ARRAY['admin', 'office']::text[],
  true,
  true,
  false
);
```

### Creating Additional Admin Users

To create multiple admin users:

1. Create each user in Supabase Auth
2. Copy their UUIDs
3. Add additional INSERT statements or use the commented multi-user template in seed-admin.sql

## Maintenance

### Re-seeding in Development

**Timeline Steps:**
- Uncomment the DELETE statement in seed-steps.sql
- Run the script
- WARNING: This deletes all lead_steps records

**Admin User:**
- Simply re-run seed-admin.sql
- The ON CONFLICT clause will update the existing user

### Production Updates

**Adding New Steps:**
- Don't delete existing steps
- Add new steps with higher order_index values
- Or insert between existing steps and update order_index for subsequent steps

**Updating Step Configuration:**
- Use UPDATE statements instead of re-seeding
- Test changes in staging first
- Consider impact on existing lead_steps records

## Related Documentation

- **SEED_DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **README.md** - Overview of all configuration files
- **supabase/models/** - Database schema definitions
- **supabase/config/rls-*.sql** - Row-level security policies

## Support

For issues with seed scripts:
1. Check SQL syntax in the Supabase SQL Editor
2. Verify prerequisites (schema and RLS policies applied)
3. Review error messages in Supabase Dashboard > Database > Logs
4. Consult SEED_DEPLOYMENT_GUIDE.md for troubleshooting
