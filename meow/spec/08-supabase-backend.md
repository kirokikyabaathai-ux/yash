# Supabase Backend Architecture

## What Supabase Handles
- Authentication
- Database (PostgreSQL)
- Storage
- Row-Level Security (RLS)
- API (SQL + Edge Functions)

Everything runs serverless → integrates perfectly with Next.js.

---

## Authentication Model (Supabase Auth)

### User Types
- Admin
- Agent
- Office
- Installer
- Customer

Each user gets a Supabase Auth account.

### Users Table
Must reference Supabase `auth.users` via:
```sql
id UUID PRIMARY KEY DEFAULT auth.uid()
```

Store:
- name
- phone
- email
- role
- status
- assigned_area (optional)
- created_at

---

## Supabase Edge Functions

These serverless functions handle:
- Signed upload URL generation
- Step-level permission checks
- Linking customer → lead via phone
- Auto-creating leads on signup
- Document validation
- Auto-updating timeline

### Required Functions
1. **get-upload-url.ts** - Generate signed URLs for file uploads
2. **complete-step.ts** - Handle step completion with permission checks
3. **link-customer.ts** - Link customer accounts to existing leads
4. **create-lead.ts** - Create new leads with proper initialization
5. **document-validation.ts** - Validate uploaded documents

All written in TypeScript and deployed to Supabase.

---

## Customer Signup + Link with Lead

### Flow
1. Customer signs up → Supabase Auth
2. Edge Function checks:
   ```sql
   SELECT * FROM leads WHERE phone = customer.phone
   ```
3. If exists → link `lead.customer_id` to new user
4. If not → create new lead with:
   ```
   created_by = customer
   source = "self"
   status = "lead"
   ```

Customer sees timeline instantly.
