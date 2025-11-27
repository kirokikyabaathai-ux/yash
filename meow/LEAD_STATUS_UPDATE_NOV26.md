# Lead Status Update - November 26, 2025

## Overview
Updated lead status flow to align with actual business process.

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
3. **lead_processing** - Customer form filled + documents uploaded, active project
4. **lead_completed** - Project finished
5. **lead_cancelled** - Customer declined/withdrew

---

## Business Flow

```
Agent finds person
    ↓
Agent creates lead (status: 'lead')
    ↓
Agent convinces person
    ↓
Person agrees → Update to 'lead_interested'
    ↓
Agent/Office fills customer profile form + uploads documents
    ↓
Auto-update → 'lead_processing'
    ↓
Office updates timeline steps (survey, proposal, payment, installation...)
    ↓
Office manually marks → 'lead_completed'
```

---

## Status Transition Rules

| From | To | Trigger | Who |
|------|-----|---------|-----|
| lead | lead_interested | Customer agrees to install | Agent/Office (manual) |
| lead_interested | lead_processing | Customer profile form submitted with documents | System (automatic) |
| lead_processing | lead_completed | All timeline steps completed | Office/Admin (manual) |
| Any | lead_cancelled | Customer withdraws | Office/Admin (manual) |

---

## Database Changes

### Migration Applied
- File: `supabase/migrations/add_lead_interested_status.sql`
- Added `lead_interested` to status constraint
- Removed `details_received` from status constraint

### Updated Files
- `supabase/models/leads.sql` - Updated status check constraint
- Database constraint now includes 5 statuses only

---

## Documentation Updated

### Files Updated in meow/
1. **meow/spec/02-lead-management.md**
   - Updated status list and descriptions
   - Updated status transition rules
   - Added note about details_received removal

2. **meow/spec/11-complete-flow.md**
   - Updated full project lifecycle diagram
   - Added customer agreement step
   - Updated detailed flow breakdown
   - Updated user journey sections

3. **meow/DOCUMENTATION_UPDATE_SUMMARY.md**
   - Added current status flow
   - Added business flow description

---

## Next Steps

### Frontend Updates Required
The following Next.js files need to be updated:

1. **Type Definitions**
   - `src/types/database.ts` - Update LeadStatus type
   - `src/types/api.ts` - Update API types

2. **Utilities**
   - `src/lib/utils/status-labels.ts` - Add lead_interested label/color, remove details_received

3. **Components**
   - `src/components/leads/FilterPanel.tsx` - Update status filters
   - `src/components/leads/QuickStatusUpdate.tsx` - Update status options
   - `src/components/leads/LeadDetailClient.tsx` - Update status display
   - All other components referencing lead status

4. **API Routes**
   - `src/app/api/leads/[id]/status/route.ts` - Update status validation
   - `src/app/api/customer-profiles/route.ts` - Update auto-status change logic
   - `src/app/api/dashboard/metrics/route.ts` - Update status queries

5. **Pages**
   - All dashboard pages showing status metrics
   - All lead detail pages

---

## Testing Checklist

- [ ] Verify database constraint accepts all 5 statuses
- [ ] Verify database rejects details_received status
- [ ] Test lead creation (status: lead)
- [ ] Test manual update to lead_interested
- [ ] Test automatic update to lead_processing on form submission
- [ ] Test manual update to lead_completed
- [ ] Test manual update to lead_cancelled
- [ ] Verify frontend displays all statuses correctly
- [ ] Verify status filters work with new statuses
- [ ] Verify dashboard metrics include lead_interested

---

## Notes

- No existing data migration needed (no leads had details_received status)
- Current database has 9 leads with 'lead', 7 with 'lead_processing', 1 with 'lead_cancelled'
- Frontend code still needs to be updated to reflect these changes
