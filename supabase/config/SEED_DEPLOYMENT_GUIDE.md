# Seed Data Deployment Guide

This guide provides step-by-step instructions for deploying seed data to your Solar CRM Supabase instance.

## Prerequisites

- Supabase project created and configured
- Database schema applied (`supabase/all-schema.sql`)
- RLS policies applied (all `rls-*.sql` files)
- Supabase CLI installed (optional but recommended)

## Deployment Steps

### Step 1: Seed Timeline Steps

The timeline steps define the workflow for solar installation projects. These steps are required for the system to function.

**Using Supabase Dashboard (Easiest):**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/config/seed-steps.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify output shows 20 steps created

**Using Supabase CLI:**

```bash
cd /path/to/solar-crm
supabase db execute -f supabase/config/seed-steps.sql
```

**Using psql:**

```bash
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f supabase/config/seed-steps.sql
```

**Verification:**

Run this query to verify steps were created:

```sql
SELECT COUNT(*) as total_steps FROM step_master;
-- Should return: 20

SELECT step_name, order_index, allowed_roles 
FROM step_master 
ORDER BY order_index 
LIMIT 5;
-- Should show first 5 steps
```

### Step 2: Create Admin User in Supabase Auth

Before running the admin seed script, you must create the admin user in Supabase Auth.

**Using Supabase Dashboard:**

1. Navigate to **Authentication** > **Users**
2. Click **Add User** (or **Invite User**)
3. Enter admin details:
   - **Email:** `admin@solarcrm.com` (or your preferred email)
   - **Password:** Create a strong password (min 8 characters)
   - **Auto Confirm User:** Check this box
4. Click **Create User**
5. **IMPORTANT:** Copy the user's UUID from the user list
   - It will look like: `550e8400-e29b-41d4-a716-446655440000`

**Using Supabase Auth API:**

```bash
curl -X POST 'https://your-project-ref.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@solarcrm.com",
    "password": "your-strong-password",
    "email_confirm": true
  }'
```

Save the returned `id` field - this is your admin UUID.

### Step 3: Update Admin Seed Script

1. Open `supabase/config/seed-admin.sql` in a text editor
2. Find the line: `'YOUR_ADMIN_USER_UUID_HERE'::uuid`
3. Replace `YOUR_ADMIN_USER_UUID_HERE` with the UUID you copied
4. Update other fields as needed:
   - `email` - Must match the email used in Supabase Auth
   - `name` - Display name for the admin
   - `phone` - Contact phone number
5. Save the file

**Example:**

```sql
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
  '550e8400-e29b-41d4-a716-446655440000'::uuid,  -- Your actual UUID
  'admin@solarcrm.com',
  'System Administrator',
  '+919999999999',
  'admin',
  'active',
  NULL
)
```

### Step 4: Seed Admin User Profile

**Using Supabase Dashboard:**

1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of your updated `supabase/config/seed-admin.sql`
4. Paste into the SQL Editor
5. Click **Run**
6. Verify output shows 1 admin user created

**Using Supabase CLI:**

```bash
supabase db execute -f supabase/config/seed-admin.sql
```

**Using psql:**

```bash
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f supabase/config/seed-admin.sql
```

**Verification:**

Run this query to verify admin user was created:

```sql
SELECT id, email, name, role, status 
FROM users 
WHERE role = 'admin';
-- Should return your admin user
```

### Step 5: Test Admin Login

1. Navigate to your Solar CRM application
2. Go to the login page
3. Enter admin credentials:
   - Email: `admin@solarcrm.com` (or your email)
   - Password: The password you set in Step 2
4. Verify you can log in successfully
5. Verify you're redirected to the admin dashboard
6. Test admin capabilities:
   - View all leads
   - Access user management
   - Access step master configuration
   - View activity logs

## Re-seeding (Development Only)

If you need to re-seed data in development:

### Re-seed Timeline Steps

**WARNING:** This will delete all existing lead_steps records due to CASCADE delete.

1. Uncomment the DELETE line in `seed-steps.sql`:
   ```sql
   DELETE FROM step_master;
   ```
2. Run the seed script again
3. Re-comment the DELETE line to prevent accidental data loss

### Re-seed Admin User

The admin seed script uses `ON CONFLICT DO UPDATE`, so you can safely re-run it to update admin details without deleting the user.

## Troubleshooting

### Issue: "duplicate key value violates unique constraint"

**For step_master:**
- Steps already exist in the database
- Either skip seeding or use the re-seeding process above

**For users:**
- Admin user already exists
- The script will update the existing user (ON CONFLICT DO UPDATE)

### Issue: "insert or update on table violates foreign key constraint"

- The UUID in seed-admin.sql doesn't match any user in Supabase Auth
- Verify you copied the correct UUID from Supabase Auth
- Ensure the admin user exists in Authentication > Users

### Issue: Admin can't log in

- Verify the email in seed-admin.sql matches the email in Supabase Auth exactly
- Check that the user is confirmed in Supabase Auth
- Verify the password is correct
- Check that user status is 'active' in the users table

### Issue: Admin doesn't have full access

- Verify the role is set to 'admin' in the users table
- Check that RLS policies are applied correctly
- Verify the admin user's UUID matches between Auth and users table

## Production Deployment Checklist

- [ ] Database schema applied
- [ ] RLS policies applied
- [ ] Storage bucket created and configured
- [ ] RPC functions deployed
- [ ] Edge functions deployed
- [ ] Timeline steps seeded (20 steps)
- [ ] Admin user created in Supabase Auth
- [ ] Admin user profile seeded in users table
- [ ] Admin login tested and verified
- [ ] Admin access to all features verified
- [ ] Admin password changed from default
- [ ] 2FA enabled for admin account (recommended)
- [ ] Backup created before seeding
- [ ] Seed scripts removed from version control or secured

## Security Best Practices

1. **Change Default Password:** Immediately change the admin password after first login
2. **Use Strong Passwords:** Minimum 12 characters with mixed case, numbers, and symbols
3. **Enable 2FA:** Enable two-factor authentication for all admin accounts
4. **Limit Admin Users:** Only create admin accounts for users who need full system access
5. **Audit Regularly:** Review admin activity in the activity_log table
6. **Secure Seed Scripts:** Don't commit seed scripts with real UUIDs or passwords to version control
7. **Rotate Credentials:** Periodically update admin passwords
8. **Monitor Access:** Set up alerts for admin login attempts and actions

## Next Steps

After seeding is complete:

1. Create additional user accounts for your team (agents, office staff, installers)
2. Configure any custom timeline steps if needed
3. Set up notification triggers
4. Test the complete workflow with a sample lead
5. Train your team on the system
6. Begin production use

## Support

If you encounter issues during seeding:

1. Check the Supabase Dashboard > Database > Logs for error messages
2. Verify all prerequisites are met
3. Review the troubleshooting section above
4. Check that your Supabase project has sufficient resources
5. Consult the main README.md for additional setup information
