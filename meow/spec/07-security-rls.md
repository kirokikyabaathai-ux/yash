# Security & Row-Level Security (RLS)

## Storage Security
- All buckets PRIVATE
- All uploads via signed URLs

## API Security
- JWT authentication
- Middleware permission-checks
- Step-level permissions validated
- Lead ownership enforced for agents & customers

## Customer Security
- Cannot see other customers' leads
- Cannot bypass upload restrictions

---

## RLS Policies

### RLS for leads

**Agents:**
```sql
agent can select/update only leads where leads.created_by = auth.uid()
```

**Customers:**
```sql
customer can select/update only leads where leads.customer_id = auth.uid()
```

**Office/Admin:**
```sql
office/admin can select all
```

**Installer:**
```sql
installer can select only assigned installation leads
```

---

### RLS for documents

**Agents:**
```sql
uploaded_by = auth.uid()
```

**Customers:**
```sql
lead.customer_id = auth.uid()
```

**Office/Admin:**
```sql
role IN ('office','admin')
```

**Installer:**
```sql
type LIKE 'installation%'
```

---

### RLS for step_master
Only Admin can modify.

---

### RLS for lead_steps
Users must match allowed_roles in the step.

This is dynamic using a **Postgres function**:
```sql
allowed_roles @> ARRAY[ current_user.role ]
```

Admin bypasses via:
```sql
role = 'admin' THEN TRUE
```

---

## Supabase Extensions Required
- `pgcrypto` (UUID)
- `pgjwt`
- `http` (for webhooks)
- `pg_stat_statements`
