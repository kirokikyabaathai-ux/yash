# API Endpoints Documentation - Solar CRM

**Base URL:** `https://gqalreoyglltniepgnnr.supabase.co`  
**API Version:** REST v1  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Leads](#leads)
4. [Documents](#documents)
5. [Step Master](#step-master)
6. [Lead Steps](#lead-steps)
7. [Customer Profiles](#customer-profiles)
8. [Notifications](#notifications)
9. [Activity Log](#activity-log)
10. [Edge Functions](#edge-functions)

---

## Authentication

### Base Path
`/auth/v1`

### Get Current User
```http
GET /auth/v1/user
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "created_at": "2025-11-27T10:00:00Z"
}
```

### Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Signup
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "data": {
    "name": "New User",
    "phone": "9876543210"
  }
}
```

### Logout
```http
POST /auth/v1/logout
Authorization: Bearer {jwt_token}
```

---

## Users

### Base Path
`/rest/v1/users`

### List Users
```http
GET /rest/v1/users?select=*&order=created_at.desc
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Query Parameters:**
- `select` - Columns to return (default: *)
- `order` - Sort order (e.g., `created_at.desc`)
- `limit` - Number of records (default: 10)
- `offset` - Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "9876543210",
    "role": "customer",
    "status": "active",
    "customer_id": "YN12345678C",
    "created_at": "2025-11-27T10:00:00Z"
  }
]
```

### Get User by ID
```http
GET /rest/v1/users?select=*&id=eq.{user_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

### Get User Role
```http
GET /rest/v1/users?select=role&id=eq.{user_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "role": "admin"
  }
]
```

### Create User (via Edge Function)
```http
POST /functions/v1/create-user
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "phone": "9876543210",
  "role": "agent",
  "assigned_area": "North Zone"
}
```

### Update User
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "disabled"
}
```

---

## Leads

### Base Path
`/rest/v1/leads`

### List Leads
```http
GET /rest/v1/leads?select=*&order=created_at.desc&limit=10
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**With Relationships:**
```http
GET /rest/v1/leads?select=*,created_by_user:created_by(id,name),customer_account:customer_account_id(id,name),installer:installer_id(id,name)&order=created_at.desc&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customer_name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "status": "lead",
    "source": "agent",
    "created_by": "uuid",
    "customer_account_id": "uuid",
    "installer_id": null,
    "created_at": "2025-11-27T10:00:00Z",
    "created_by_user": {
      "id": "uuid",
      "name": "Agent Name"
    }
  }
]
```

### Get Lead by ID
```http
GET /rest/v1/leads?select=*&id=eq.{lead_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

### Create Lead
```http
POST /rest/v1/leads
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json
Prefer: return=representation

{
  "customer_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St",
  "notes": "Interested in 5kW system",
  "source": "agent"
}
```

### Update Lead
```http
PATCH /rest/v1/leads?id=eq.{lead_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "status": "lead_interested",
  "installer_id": "uuid"
}
```

### Filter Leads by Status
```http
GET /rest/v1/leads?select=*&status=eq.lead_processing
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

### Filter Leads by Agent
```http
GET /rest/v1/leads?select=*&created_by=eq.{agent_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

---

## Documents

### Base Path
`/rest/v1/documents`

### List Documents for Lead
```http
GET /rest/v1/documents?select=*&lead_id=eq.{lead_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "lead_id": "uuid",
    "type": "mandatory",
    "document_category": "aadhaar_front",
    "file_path": "leads/{lead_id}/mandatory/{uuid}.pdf",
    "file_name": "aadhaar_front.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "uploaded_by": "uuid",
    "status": "valid",
    "uploaded_at": "2025-11-27T10:00:00Z"
  }
]
```

### Get Upload URL (Edge Function)
```http
POST /functions/v1/get-upload-url
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "lead_id": "uuid",
  "document_type": "mandatory",
  "document_category": "aadhaar_front",
  "file_name": "aadhaar.pdf",
  "mime_type": "application/pdf"
}
```

**Response:**
```json
{
  "upload_url": "https://...",
  "file_path": "leads/{lead_id}/mandatory/{uuid}.pdf",
  "expires_in": 3600
}
```

### Upload Document (Two-step process)

**Step 1: Get signed URL**
```http
POST /functions/v1/get-upload-url
```

**Step 2: Upload to signed URL**
```http
PUT {upload_url}
Content-Type: {mime_type}
Content-Length: {file_size}

{binary_file_data}
```

**Step 3: Record in database**
```http
POST /rest/v1/documents
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "lead_id": "uuid",
  "type": "mandatory",
  "document_category": "aadhaar_front",
  "file_path": "leads/{lead_id}/mandatory/{uuid}.pdf",
  "file_name": "aadhaar.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf"
}
```

### Mark Document as Corrupted
```http
PATCH /rest/v1/documents?id=eq.{document_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "status": "corrupted"
}
```

---

## Step Master

### Base Path
`/rest/v1/step_master`

### List All Steps
```http
GET /rest/v1/step_master?select=*&order=order_index.asc
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "step_name": "Lead Created",
    "order_index": "1000.0000000000",
    "allowed_roles": ["admin", "office", "agent"],
    "remarks_required": false,
    "attachments_allowed": false,
    "customer_upload": false,
    "requires_installer_assignment": false,
    "created_at": "2025-11-23T19:10:34Z"
  }
]
```

### Create Step (Admin only)
```http
POST /rest/v1/step_master
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json
Prefer: return=representation

{
  "step_name": "New Step",
  "order_index": 15000,
  "allowed_roles": ["office", "admin"],
  "remarks_required": true,
  "attachments_allowed": true,
  "customer_upload": false
}
```

### Update Step
```http
PATCH /rest/v1/step_master?id=eq.{step_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "step_name": "Updated Step Name",
  "allowed_roles": ["office", "admin", "installer"]
}
```

### Delete Step
```http
DELETE /rest/v1/step_master?id=eq.{step_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

### Reorder Steps
```http
PATCH /rest/v1/step_master?id=eq.{step_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "order_index": 5500
}
```

---

## Lead Steps

### Base Path
`/rest/v1/lead_steps`

### Get Timeline for Lead
```http
GET /rest/v1/lead_steps?select=*,step:step_id(*)&lead_id=eq.{lead_id}&order=step.order_index.asc
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "lead_id": "uuid",
    "step_id": "uuid",
    "status": "completed",
    "completed_by": "uuid",
    "completed_at": "2025-11-27T10:00:00Z",
    "remarks": "Step completed successfully",
    "attachments": ["path/to/file.pdf"],
    "step": {
      "id": "uuid",
      "step_name": "Lead Created",
      "order_index": "1000.0000000000"
    }
  }
]
```

### Complete Step (via RPC)
```http
POST /rest/v1/rpc/complete_step
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "p_lead_id": "uuid",
  "p_step_id": "uuid",
  "p_remarks": "Completed with notes",
  "p_attachments": ["path/to/file.pdf"]
}
```

### Update Step
```http
PATCH /rest/v1/lead_steps?id=eq.{lead_step_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "remarks": "Updated remarks",
  "attachments": ["path/to/file1.pdf", "path/to/file2.pdf"]
}
```

---

## Customer Profiles

### Base Path
`/rest/v1/customer_profiles`

### Get Customer Profile
```http
GET /rest/v1/customer_profiles?select=*&user_id=eq.{user_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "lead_id": "uuid",
    "name": "John Doe",
    "gender": "male",
    "address_line_1": "123 Main St",
    "pin_code": "123456",
    "state": "Maharashtra",
    "district": "Mumbai",
    "account_holder_name": "John Doe",
    "bank_account_number": "1234567890",
    "bank_name": "State Bank",
    "ifsc_code": "SBIN0001234",
    "aadhaar_front_path": "path/to/aadhaar_front.pdf",
    "created_at": "2025-11-27T10:00:00Z"
  }
]
```

### Create Customer Profile
```http
POST /rest/v1/customer_profiles
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json
Prefer: return=representation

{
  "lead_id": "uuid",
  "name": "John Doe",
  "gender": "male",
  "address_line_1": "123 Main St",
  "pin_code": "123456",
  "state": "Maharashtra",
  "district": "Mumbai",
  "account_holder_name": "John Doe",
  "bank_account_number": "1234567890",
  "bank_name": "State Bank",
  "ifsc_code": "SBIN0001234"
}
```

### Update Customer Profile
```http
PATCH /rest/v1/customer_profiles?id=eq.{profile_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "address_line_2": "Apartment 4B",
  "aadhaar_front_path": "path/to/new_aadhaar.pdf"
}
```

### Save Draft
```http
POST /rest/v1/customer_profile_drafts
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "lead_id": "uuid",
  "draft_data": {
    "name": "John Doe",
    "address_line_1": "123 Main St",
    "step": 2
  }
}
```

### Get Draft
```http
GET /rest/v1/customer_profile_drafts?select=*&user_id=eq.{user_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

---

## Notifications

### Base Path
`/rest/v1/notifications`

### List User Notifications
```http
GET /rest/v1/notifications?select=*&user_id=eq.{user_id}&order=created_at.desc
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "lead_id": "uuid",
    "type": "step_completion",
    "title": "Step Completed",
    "message": "Survey step has been completed",
    "read": false,
    "created_at": "2025-11-27T10:00:00Z"
  }
]
```

### Mark as Read
```http
PATCH /rest/v1/notifications?id=eq.{notification_id}
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "read": true
}
```

### Get Unread Count
```http
GET /rest/v1/notifications?select=count&user_id=eq.{user_id}&read=eq.false
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

---

## Activity Log

### Base Path
`/rest/v1/activity_log`

### List Activities for Lead
```http
GET /rest/v1/activity_log?select=*,user:user_id(name)&lead_id=eq.{lead_id}&order=timestamp.desc
Authorization: Bearer {jwt_token}
apikey: {anon_key}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "lead_id": "uuid",
    "user_id": "uuid",
    "action": "lead_updated",
    "entity_type": "lead",
    "entity_id": "uuid",
    "old_value": {"status": "lead"},
    "new_value": {"status": "lead_interested"},
    "timestamp": "2025-11-27T10:00:00Z",
    "user": {
      "name": "Agent Name"
    }
  }
]
```

### Create Activity Log
```http
POST /rest/v1/activity_log
Authorization: Bearer {jwt_token}
apikey: {anon_key}
Content-Type: application/json

{
  "lead_id": "uuid",
  "action": "document_uploaded",
  "entity_type": "document",
  "entity_id": "uuid",
  "new_value": {"file_name": "aadhaar.pdf"}
}
```

---

## Edge Functions

### Base Path
`/functions/v1`

### 1. Get Upload URL
```http
POST /functions/v1/get-upload-url
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "lead_id": "uuid",
  "document_type": "mandatory",
  "document_category": "aadhaar_front",
  "file_name": "aadhaar.pdf",
  "mime_type": "application/pdf"
}
```

**Response:**
```json
{
  "success": true,
  "upload_url": "https://gqalreoyglltniepgnnr.supabase.co/storage/v1/object/upload/sign/...",
  "file_path": "leads/{lead_id}/mandatory/{uuid}.pdf",
  "expires_in": 3600
}
```

### 2. Document Validation
```http
POST /functions/v1/document-validation
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "document_id": "uuid",
  "validation_type": "format_check"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "issues": []
}
```

### 3. Activity Logger
```http
POST /functions/v1/activity-logger
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "lead_id": "uuid",
  "action": "custom_action",
  "details": {
    "key": "value"
  }
}
```

### 4. Create User
```http
POST /functions/v1/create-user
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "New User",
  "phone": "9876543210",
  "role": "agent",
  "assigned_area": "North Zone"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "agent_id": "YN12345678A"
  }
}
```

---

## Common Query Patterns

### Pagination
```http
GET /rest/v1/leads?select=*&limit=10&offset=20
```

### Filtering
```http
GET /rest/v1/leads?select=*&status=eq.lead_processing&source=eq.agent
```

### Sorting
```http
GET /rest/v1/leads?select=*&order=created_at.desc,customer_name.asc
```

### Counting
```http
GET /rest/v1/leads?select=count
```

### Full-text Search
```http
GET /rest/v1/leads?select=*&customer_name=ilike.*john*
```

### Range Queries
```http
GET /rest/v1/leads?select=*&created_at=gte.2025-11-01&created_at=lte.2025-11-30
```

### Nested Relationships
```http
GET /rest/v1/leads?select=*,documents(*),lead_steps(*)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "code": "PGRST102",
  "message": "Invalid query parameter",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid JWT token"
}
```

### 403 Forbidden
```json
{
  "message": "Row level security policy violation"
}
```

### 404 Not Found
```json
{
  "message": "No rows found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "details": "..."
}
```

---

## Rate Limiting

**Current Status:** Not configured  
**Recommendation:** Implement rate limiting for production

**Suggested Limits:**
- Authentication: 5 requests/minute per IP
- Read operations: 100 requests/minute per user
- Write operations: 30 requests/minute per user
- File uploads: 10 requests/minute per user

---

## Testing with cURL

### Example: Login and Get Leads
```bash
# Login
TOKEN=$(curl -X POST 'https://gqalreoyglltniepgnnr.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -d '{"email":"admin@solarcrm.com","password":"your_password"}' \
  | jq -r '.access_token')

# Get leads
curl 'https://gqalreoyglltniepgnnr.supabase.co/rest/v1/leads?select=*' \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

---

*Last Updated: November 27, 2025*
