# Next.js Frontend Architecture

## Technology
Use **Next.js App Router** with:
- Server Actions
- Route Handlers (`app/api/...`)
- Supabase client components
- Supabase server client for secure operations
- Using @supabase/auth-helpers-nextjs

---

## Folder Structure

```
/app
   /admin
   /agent
   /office
   /installer
   /customer
   /lead/[id]
   /api
       /auth
       /leads
       /steps
       /documents
       /pmsuryaghar
/components
/lib
   supabaseClient.ts
   auth.ts
   roles.ts
/hooks
/styles
```

---

## Route Flow

### Login Route
`/login`

Uses Supabase Auth email/password or OTP.

### Dashboard Routes (role-specific)
- Admin → `/admin/dashboard`
- Office → `/office/dashboard`
- Agent → `/agent/dashboard`
- Installer → `/installer/dashboard`
- Customer → `/customer/dashboard`

### Lead Detail Route
`/lead/[id]`

Components:
- Lead information
- Timeline view
- Document uploads
- Activity log

Permissions enforced via server-side checks + RLS.

---

## Recommended Libraries
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- react-hook-form (for forms)
- zod (validation)
- tailwindcss (styling)
- shadcn/ui (UI components)
