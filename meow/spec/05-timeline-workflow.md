# Timeline / Workflow Engine

The timeline represents the entire solar project lifecycle.

## Step Master (Admin Editable)

### Admin Capabilities
- Add step
- Delete step
- Reorder steps
- Rename steps
- Set allowed_roles per step
- Set attachment_required
- Set remarks_required
- Set customer_upload flag
- Make steps admin-only

## Default Steps (Initial Template)
1. Lead Created
2. Documents Collected
3. Application Started
4. Survey Scheduled
5. Survey Completed
6. Proposal Sent
7. Payment or Loan Option
8. Payment Received / Loan Flow
9. Installation Scheduled
10. Installation Completed
11. Net Meter Applied
12. Commissioning
13. Subsidy Submitted
14. Subsidy Released
15. Project Closed

**Admin can delete any step and add new ones.**

## Step Completion Flow
1. User opens step
2. Checks permission
3. Uploads file / enters remarks
4. Marks step as completed
5. System auto-updates next step

## Step Permissions

### Step Fields
```
allowed_roles: ["admin", "office", "installer", "agent", "customer"]
remarks_required: boolean
attachments_allowed: boolean
customer_upload: boolean
```

**Admin override always allowed.**

## Timeline Implementation in Next.js

### Algorithm
1. Fetch steps from `step_master` (ordered by index)
2. Fetch `lead_steps` for the lead
3. Merge both lists

### For Each Step
```
status = completed | pending | upcoming
completed_at = timestamp
completed_by = user
remarks = text
attachments = documents
allowed_roles = array
```

### UI Display
- Completed steps → Green
- Pending (current) → Yellow
- Upcoming → Grey

If `step.customer_upload = true` → show upload button for customers.

## Step Permission Handling

### When User Tries to Mark Step Complete
1. Next.js calls: `POST /api/steps/{step_id}/complete`
2. API route calls Supabase RPC function: `complete_step(lead_id, step_id, user_id)`
3. RPC checks:
   ```
   IF current_user.role IN allowed_roles OR role = 'admin':
       update lead_steps
   ELSE:
       raise error
   ```
