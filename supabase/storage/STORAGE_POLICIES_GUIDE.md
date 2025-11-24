# Storage Bucket RLS Policies Setup Guide

This guide helps you manually create the storage policies in the Supabase Dashboard.

## Setup Instructions

1. Go to Supabase Dashboard → Storage → Policies
2. Select the `solar-projects` bucket
3. Click "New Policy" for each policy below
4. Select the operation type and paste the corresponding policy

---

## Admin Policies (4 policies)

### 1. Admin can view all files
- **Operation**: SELECT
- **Policy Name**: `Admin can view all files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
)
```

### 2. Admin can upload files
- **Operation**: INSERT
- **Policy Name**: `Admin can upload files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
)
```

### 3. Admin can update files
- **Operation**: UPDATE
- **Policy Name**: `Admin can update files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
)
```

### 4. Admin can delete files
- **Operation**: DELETE
- **Policy Name**: `Admin can delete files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
)
```

---

## Office Team Policies (4 policies)

### 5. Office can view all files
- **Operation**: SELECT
- **Policy Name**: `Office can view all files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'office'
)
```

### 6. Office can upload files
- **Operation**: INSERT
- **Policy Name**: `Office can upload files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'office'
)
```

### 7. Office can update files
- **Operation**: UPDATE
- **Policy Name**: `Office can update files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'office'
)
```

### 8. Office can delete files
- **Operation**: DELETE
- **Policy Name**: `Office can delete files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'office'
)
```

---

## Agent Policies (4 policies)

### 9. Agent can view own lead files
- **Operation**: SELECT
- **Policy Name**: `Agent can view own lead files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.created_by = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'agent'
)
```

### 10. Agent can upload to own leads
- **Operation**: INSERT
- **Policy Name**: `Agent can upload to own leads`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.created_by = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'agent'
)
```

### 11. Agent can update own lead files
- **Operation**: UPDATE
- **Policy Name**: `Agent can update own lead files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.created_by = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'agent'
)
```

### 12. Agent can delete own lead files
- **Operation**: DELETE
- **Policy Name**: `Agent can delete own lead files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.created_by = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'agent'
)
```

---

## Customer Policies (4 policies)

### 13. Customer can view own lead files
- **Operation**: SELECT
- **Policy Name**: `Customer can view own lead files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.customer_account_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'customer'
)
```

### 14. Customer can upload to own lead customer folder
- **Operation**: INSERT
- **Policy Name**: `Customer can upload to own lead customer folder`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'customer'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.customer_account_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'customer'
)
```

### 15. Customer can update own files
- **Operation**: UPDATE
- **Policy Name**: `Customer can update own files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'customer'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.customer_account_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'customer'
)
```

### 16. Customer can delete own files
- **Operation**: DELETE
- **Policy Name**: `Customer can delete own files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'customer'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.customer_account_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'customer'
)
```

---

## Installer Policies (4 policies)

### 17. Installer can view installation files
- **Operation**: SELECT
- **Policy Name**: `Installer can view installation files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'installation'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.installer_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'installer'
)
```

### 18. Installer can upload installation files
- **Operation**: INSERT
- **Policy Name**: `Installer can upload installation files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'installation'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.installer_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'installer'
)
```

### 19. Installer can update installation files
- **Operation**: UPDATE
- **Policy Name**: `Installer can update installation files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'installation'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.installer_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'installer'
)
```

### 20. Installer can delete installation files
- **Operation**: DELETE
- **Policy Name**: `Installer can delete installation files`
- **Policy Definition**:
```sql
bucket_id = 'solar-projects'
AND (string_to_array(name, '/'))[3] = 'installation'
AND EXISTS (
  SELECT 1 FROM leads
  WHERE leads.id::text = (string_to_array(name, '/'))[2]
  AND leads.installer_id = auth.uid()
)
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'installer'
)
```

---

## Summary

**Total Policies to Create: 20**

- Admin: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Office: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Agent: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Customer: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Installer: 4 policies (SELECT, INSERT, UPDATE, DELETE)

Each role has full CRUD operations but with different access restrictions based on their role and relationship to the lead.
