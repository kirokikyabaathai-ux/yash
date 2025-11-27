# Auto Lead Creation for Customer Signups

## Summary
Implemented automatic lead creation when customers sign up through the authentication system.

## Changes Made

### Database Migration
- **File**: `supabase/migrations/20251127130000_auto_create_lead_for_customer_signup.sql`
- **Applied**: Yes (to project `gqalreoyglltniepgnnr`)

### Functionality
The `handle_new_user()` trigger function now:

1. **Creates user profile** (existing behavior)
   - Extracts user metadata (name, phone, role)
   - Inserts into `public.users` table
   - Defaults to 'customer' role if not specified

2. **Auto-creates lead for customers** (NEW)
   - Only triggers when `role = 'customer'`
   - Creates a lead with:
     - `source = 'self'` (indicating customer self-signup)
     - `customer_name` = user's name
     - `phone` = user's phone
     - `email` = user's email
     - `address` = empty (to be filled later)
     - `notes` = "Auto-created lead from customer signup"
     - `created_by` = customer's user ID
     - `customer_account_id` = customer's user ID (links lead to account)
     - `status` = 'lead' (initial status - matches createLead function behavior)

### Lead Status Flow
The auto-created lead starts with `status = 'lead'`, which is the same initial status used by the `createLead()` function. Valid status values are:
- `'lead'` - Initial contact (auto-signup starts here)
- `'lead_interested'` - Customer agreed
- `'lead_processing'` - Form filled + active project
- `'lead_completed'` - Finished
- `'lead_cancelled'` - Declined/withdrew

### Trigger Flow
```
Customer Signs Up
    ↓
auth.users INSERT
    ↓
on_auth_user_created TRIGGER fires
    ↓
handle_new_user() function executes
    ↓
1. Creates public.users record
2. IF role='customer' → Creates leads record with source='self'
```

## Testing
To test this functionality:
1. Create a new customer user through signup
2. Check that a lead is automatically created with `source='self'`
3. Verify the lead is linked to the customer account via `customer_account_id`

## Notes
- Only applies to new customer signups (role='customer')
- Admin-created users with other roles (agent, office, installer) will NOT get auto-leads
- The lead is created in the same transaction as the user, ensuring data consistency
