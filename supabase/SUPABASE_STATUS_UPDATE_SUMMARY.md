# Supabase Status Update Summary - November 26, 2025

## Overview
Updated all Supabase backend files to reflect the new lead status flow with `lead_interested` status.

---

## Status Changes

### Added Status
- **lead_interested** - Customer agreed to install solar

### Removed Status  
- **details_received** - No longer needed in business flow

---

## Final Lead Statuses (5 total)

1. **lead** - Initial contact, agent found the person
2. **lead_interested** - Customer agreed to proceed
3. **lead_processing** - Customer profile form filled + documents uploaded, active project
4. **lead_completed** - Project finished
5. **lead_cancelled** - Customer declined/withdrew

---

## Files Updated

### 1. Database Models
**File:** `supabase/models/leads.sql`
- Updated status constraint to include `lead_interested`
- Removed `details_received` from constraint
- Updated column comment

### 2. Database Schema
**File:** `supabase/all-schema.sql`
- Updated leads table status constraint
- Changed default status from 'ongoing' to 'lead'
- Updated CHECK constraint with new 5 statuses

### 3. RPC Functions

#### `supabase/rpc/update_lead_status.sql`
- Updated function comments to reference customer profile instead of PM Suryaghar form
- Changed variable name from `v_pm_form_submitted` to `v_profile_submitted`
- Updated query to check `customer_profiles` table instead of `pm_suryaghar_form`
- Updated status transition logic:
  - Prioritizes `lead_interested → lead_processing` when profile is submitted
  - Falls back to checking both profile and documents for other statuses
- Updated result messages to reference profile submission

#### `supabase/rpc/link_customer_to_lead.sql`
- No changes needed (already uses 'lead' as default status)

### 4. Migrations

#### Created New Migration
**File:** `supabase/migrations/add_lead_interested_status.sql`
- Drops existing status constraint
- Adds new constraint with `lead_interested` status
- Updates column comment

#### Created New Migration
**File:** `supabase/migrations/remove_details_received_status.sql`
- Drops existing status constraint
- Adds new constraint without `details_received` status
- Updates column comment

---

## Status Transition Logic

### Automatic Transitions
The `update_lead_status()` RPC function handles automatic status updates:

```sql
IF customer_profile_submitted AND current_status = 'lead_interested' THEN
  UPDATE status to 'lead_processing'
```

### Manual Transitions
- `lead → lead_interested`: Agent/Office manually updates when customer agrees
- `lead_processing → lead_completed`: Office/Admin manually updates when project finishes
- `Any → lead_cancelled`: Office/Admin manually updates when customer withdraws

---

## Database Constraint

**Current Constraint:**
```sql
CHECK (status = ANY (ARRAY[
  'lead'::text,
  'lead_interested'::text,
  'lead_processing'::text, 
  'lead_completed'::text, 
  'lead_cancelled'::text
]))
```

**Column Comment:**
```
Lead status: lead (initial contact), lead_interested (customer agreed), 
lead_processing (form filled, active project), lead_completed (finished), 
lead_cancelled (withdrawn)
```

---

## RLS Policies

No changes required to RLS policies as they filter by user role, not by status values.

---

## Edge Functions

Edge functions may need updates if they reference status values directly. Check:
- `supabase/edge-functions/activity-logger/`
- `supabase/edge-functions/document-validation/`
- Any custom edge functions that query or update lead status

---

## Testing Checklist

### Database Tests
- [x] Migration applied successfully
- [x] Database accepts all 5 new statuses
- [x] Database rejects old statuses (ongoing, interested, not_interested, closed, details_received)
- [ ] RPC function `update_lead_status()` works with new logic
- [ ] RPC function `link_customer_to_lead()` creates leads with 'lead' status

### Integration Tests
- [ ] Customer profile submission triggers status update to lead_processing
- [ ] Manual status updates work (lead → lead_interested)
- [ ] Activity log captures status changes correctly
- [ ] Notifications trigger on status changes

---

## Migration History

1. **20251126000000_update_lead_status_values.sql** - Initial status migration (old → new)
2. **add_lead_interested_status.sql** - Added lead_interested status
3. **remove_details_received_status.sql** - Removed details_received status

---

## Next Steps

### Frontend Integration
The Next.js application needs to be updated to:
1. Use new status values in all components
2. Update status labels and colors
3. Update API routes to handle new statuses
4. Update dashboard metrics and filters
5. Test automatic status transitions on form submission

See `meow/LEAD_STATUS_UPDATE_NOV26.md` for frontend update requirements.

---

## Notes

- All migrations have been applied to project: `gqalreoyglltniepgnnr`
- No data migration needed (no leads had details_received status)
- Current database: 9 leads with 'lead', 7 with 'lead_processing', 1 with 'lead_cancelled'
- RPC functions updated to use customer_profiles table instead of pm_suryaghar_form
- All status transitions maintain backward compatibility with existing data
