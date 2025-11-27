# Deployment Strategy

## Frontend Deployment

### Vercel (Recommended)
- Deploy Next.js to Vercel
- Use Server Actions for backend logic
- Environment variables for Supabase connection
- Automatic deployments from Git

### Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Backend Deployment

### Supabase Handles
- Auth
- Database
- Storage
- Edge Functions
- Real-time events

### Setup Steps
1. Create Supabase project
2. Run database migrations
3. Configure RLS policies
4. Deploy Edge Functions
5. Set up storage buckets
6. Configure authentication providers

---

## Database Migrations

### Migration Files
Create migration files in order:
1. `001_create_users_table.sql`
2. `002_create_leads_table.sql`
3. `003_create_documents_table.sql`
4. `004_create_step_master_table.sql`
5. `005_create_lead_steps_table.sql`
6. `006_create_activity_log_table.sql`
7. `007_create_rls_policies.sql`
9. `009_create_functions.sql`
10. `010_seed_default_steps.sql`

---

## Storage Configuration

### Bucket Setup
1. Create bucket: `solar-projects`
2. Set bucket to private
3. Configure RLS policies for bucket access
4. Set up CORS if needed

---

## Edge Functions Deployment

### Deploy Commands
```bash
supabase functions deploy get-upload-url
supabase functions deploy complete-step
supabase functions deploy link-customer
supabase functions deploy create-lead
supabase functions deploy document-validation
```

---

## Environment Setup

### Development
- Local Supabase instance (optional)
- Development Supabase project
- Local Next.js dev server

### Staging
- Staging Supabase project
- Vercel preview deployments

### Production
- Production Supabase project
- Vercel production deployment
- Custom domain configuration

---

## Monitoring & Maintenance

### Supabase Dashboard
- Monitor database performance
- Check storage usage
- Review auth logs
- Monitor Edge Function logs

### Vercel Dashboard
- Monitor deployment status
- Check function logs
- Review analytics
- Monitor performance

---

## Backup Strategy

### Database Backups
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backup exports for critical data

### Storage Backups
- Regular bucket exports
- Document archival strategy
- Retention policy configuration
