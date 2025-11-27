# Lead Management System

## Lead Creation Sources
A lead can be created by:
- Agent
- Office
- Admin
- Customer (self-signup)

## Lead Fields
- Name
- Phone
- Email
- Address
- KW requirement
- Roof type
- Notes

## Lead Status

1. **lead** (default) - Initial contact, agent found the person
2. **lead_interested** - Customer agreed to proceed
3. **lead_processing** - Customer form filled + documents uploaded, active project with timeline updates
4. **lead_completed** - Project finished
5. **lead_cancelled** - Customer declined/withdrew

## Lead Status Rules

Lead status transitions:
- **lead → lead_interested**: When customer agrees to install solar (manual by Agent/Office)
- **lead_interested → lead_processing**: When customer profile form is filled and documents uploaded (automatic)
- **lead_processing → lead_completed**: When all timeline steps are completed and project is closed (manual by Office/Admin)
- **Any Status → lead_cancelled**: When customer withdraws or lead is cancelled (manual by Office/Admin)

**Note:** `details_received` status has been removed - form submission directly moves lead to `lead_processing`

Admin can override status anytime.

## Lead Ownership
- Leads created by **Agent** → belong to agent
- Leads created by **Customer** → belong to customer
- Office/Admin → can access all leads
- Installer → installation stage only

## Customer Account Linking

### Customer Signup Flow
Customer provides:
- Name
- Phone (PRIMARY KEY)
- Email
- Password

### System Logic
```
if phone exists in leads:
    link customer to that lead
else:
    create new lead
```

### If Lead Exists
- Link customer to lead
- Customer sees timeline
- Customer can upload documents

### If Lead Does Not Exist
- Create lead with:
  - created_by = customer
  - source = "self" or "website"
- Customer can now upload required documents
