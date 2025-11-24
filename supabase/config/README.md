# Supabase Configuration

This directory contains Row-Level Security (RLS) policy definitions and seed data scripts for the Solar CRM system.

## Files

### RLS Policies
- `rls-leads.sql` - RLS policies for the leads table
- `rls-documents.sql` - RLS policies for the documents table
- `rls-step-master.sql` - RLS policies for the step_master table
- `rls-other.sql` - RLS policies for lead_steps, pm_suryaghar_form, activity_log, and notifications tables

### Seed Data
- `seed-steps.sql` - Default timeline steps for the workflow engine
- `seed-admin.sql` - Initial admin user account setup
- `notification-triggers.sql` - Database triggers for notification creation

## Initial Setup Order

When setting up a new Solar CRM instance, apply configurations in this order:

1. **Database Schema** - Apply `supabase/all-schema.sql` first
2. **RLS Policies** - Apply RLS policy files
3. **Seed Data** - Apply seed scripts
4. **Triggers** - Apply notification triggers

## Applying RLS Policies

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed and configured:

```bash
# Navigate to project root
cd /path/to/solar-crm

# Apply all RLS policies
supabase db push
```

### Option 2: Using psql

If you prefer to use psql directly:

```bash
# Apply RLS policies in order
psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-leads.sql
psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-documents.sql
psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-step-master.sql
psql -h your-db-host -U postgres -d postgres -f supabase/config/rls-other.sql
```

### Option 3: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each SQL file
4. Execute them in order:
   - rls-leads.sql
   - rls-documents.sql
   - rls-step-master.sql
   - rls-other.sql

## Applying Seed Data

### Seeding Timeline Steps

The `seed-steps.sql` script creates 20 default timeline steps covering the complete solar installation workflow:

```bash
# Using Supabase CLI
supabase db execute -f supabase/config/seed-steps.sql

# Using psql
psql -h your-db-host -U postgres -d postgres -f supabase/config/seed-steps.sql

# Using Supabase Dashboard
# Copy and paste the contents of seed-steps.sql in SQL Editor
```

**Default Steps Created:**
1. Lead Created
2. Initial Contact
3. Site Survey
4. Document Collection
5. PM Suryaghar Form Submission
6. Proposal Generation
7. Proposal Approval
8. Payment/Loan Processing
9. Installer Assignment
10. Installation Scheduling
11. Installation in Progress
12. Installation Completed
13. Quality Inspection
14. Commissioning
15. Net Meter Application
16. Net Meter Installation
17. Subsidy Application
18. Subsidy Approval
19. Subsidy Release
20. Project Closure

### Seeding Admin User

The `seed-admin.sql` script creates the initial admin account. **Important:** You must first create the admin user in Supabase Auth, then update the script with the user's UUID.

**Steps:**

1. Create admin user in Supabase Auth:
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add User"
   - Email: `admin@solarcrm.com` (or your preferred email)
   - Set a strong password
   - Copy the generated UUID

2. Update `seed-admin.sql`:
   - Replace `'YOUR_ADMIN_USER_UUID_HERE'` with the copied UUID
   - Update email, name, and phone as needed

3. Run the script:
   ```bash
   # Using Supabase CLI
   supabase db execute -f supabase/config/seed-admin.sql
   
   # Using psql
   psql -h your-db-host -U postgres -d postgres -f supabase/config/seed-admin.sql
   
   # Using Supabase Dashboard
   # Copy and paste the contents of seed-admin.sql in SQL Editor
   ```

4. Verify the admin user can log in and has full access

## RLS Policy Overview

### Leads Table
- **Admin**: Full access to all leads
- **Office**: Full access to all leads
- **Agent**: Can only access leads they created
- **Customer**: Can only view their linked lead
- **Installer**: Can only view leads assigned to them

### Documents Table
- **Admin**: Full access to all documents
- **Office**: Full access to all documents
- **Agent**: Can access documents for their leads
- **Customer**: Can view and upload documents for their lead
- **Installer**: Can view and upload installation documents only

### Step Master Table
- **All Users**: Can read all steps
- **Admin Only**: Can modify (insert, update, delete) steps

### Lead Steps Table
- **Admin**: Full access
- **Office**: Full access
- **Agent**: Can access steps for their leads
- **Customer**: Can view steps for their lead
- **Installer**: Can view and update steps for assigned leads

### PM Suryaghar Form Table
- **Admin**: Full access
- **Office**: Full access
- **Agent**: Can access forms for their leads
- **Customer**: Can view and submit forms for their lead
- **Installer**: No access (enforces data restriction)

### Activity Log Table
- **Admin**: Can view all logs
- **Office**: Can view all logs
- **All Users**: Can insert their own activity logs
- **Agent**: Can view logs for their leads

### Notifications Table
- **Admin**: Can view all notifications
- **All Users**: Can view and update their own notifications
- **System**: Can insert notifications for any user

## Testing RLS Policies

After applying the RLS policies, you can test them using the property-based tests in `__tests__/rls-policies.test.ts`.

See `__tests__/README.md` for instructions on running the tests.

## Security Notes

1. **Service Role Key**: The service role key bypasses RLS policies. Keep it secure and only use it server-side.
2. **Anon Key**: The anon key respects RLS policies and should be used for client-side operations.
3. **User Context**: RLS policies use `auth.uid()` to identify the current user. Ensure proper authentication is in place.
4. **Policy Order**: Policies are evaluated in order. The first matching policy grants access.
5. **Admin Override**: Admin users bypass most restrictions, but this is intentional for system management.

## Troubleshooting

### Issue: RLS policies not working
- Verify that RLS is enabled on the table: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check that you're using the correct authentication token
- Verify the user's role in the users table

### Issue: Access denied errors
- Check that the user has the correct role assigned
- Verify that the RLS policy conditions match your use case
- Use the Supabase dashboard to inspect policy evaluation

### Issue: Performance concerns
- RLS policies are evaluated on every query
- Ensure proper indexes exist on columns used in RLS policies (created_by, customer_account_id, installer_id, user_id)
- Monitor query performance in the Supabase dashboard

## Requirements Validation

These RLS policies implement the following requirements:

- **Requirement 8.1**: Agent lead visibility restriction
- **Requirement 8.2**: Customer lead visibility restriction
- **Requirement 8.3**: Office and Admin full access
- **Requirement 8.4**: Installer lead visibility restriction
- **Requirement 8.5**: Step Master admin-only modification
