# Database Schema

## Key Tables

### users
- id (UUID, references auth.users)
- name
- phone
- email
- role
- password_hash
- status
- assigned_area (optional)
- created_at

### leads
- id
- customer_name
- phone
- email
- address
- status
- created_by (user_id or "customer")
- customer_account_id
- source
- kw_requirement
- roof_type
- notes
- created_at

### documents
- id
- lead_id
- type
- file_path
- uploaded_by
- status (valid/corrupted)
- uploaded_at

### step_master
- id
- step_name
- order_index
- allowed_roles[] (array)
- remarks_required (boolean)
- attachments_allowed (boolean)
- customer_upload (boolean)

### lead_steps
- id
- lead_id
- step_id
- status
- completed_by
- completed_at
- remarks
- attachments
- json_data
- submitted_by
- submitted_at

### activity_log
- id
- lead_id
- user_id
- action
- timestamp
- old_value
- new_value

### customer_accounts (optional)
- id
- user_id
- linked_lead_id
- created_at
