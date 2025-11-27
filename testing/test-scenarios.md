# Test Scenarios - Solar CRM

**Project:** Solar CRM  
**Version:** 1.0  
**Last Updated:** November 27, 2025

---

## Test Environment Setup

### Prerequisites
- Supabase Project: gqalreoyglltniepgnnr
- Test users created for each role
- Sample leads and documents
- Edge functions deployed

### Test Data
```javascript
const testUsers = {
  admin: {
    email: "admin@solarcrm.com",
    password: "admin_password",
    phone: "9999999999"
  },
  agent: {
    email: "agent@test.com",
    password: "agent_password",
    phone: "9876543210"
  },
  office: {
    email: "office@test.com",
    password: "office_password",
    phone: "9876543211"
  },
  installer: {
    email: "installer@test.com",
    password: "installer_password",
    phone: "9876543212"
  },
  customer: {
    email: "customer@test.com",
    password: "customer_password",
    phone: "9876543213"
  }
};
```

---

## 1. Authentication Tests

### TC-AUTH-001: Admin Login
**Priority:** Critical  
**Role:** Admin

**Steps:**
1. Navigate to login page
2. Enter admin credentials
3. Click login button

**Expected Result:**
- Successful login
- Redirected to admin dashboard
- JWT token stored in session
- User role displayed as "Admin"

**Test Data:**
```json
{
  "email": "admin@solarcrm.com",
  "password": "admin_password"
}
```

---

### TC-AUTH-002: Customer Signup
**Priority:** Critical  
**Role:** Customer

**Steps:**
1. Navigate to signup page
2. Enter customer details (name, email, phone, password)
3. Submit form
4. Verify email (if enabled)

**Expected Result:**
- Account created successfully
- Auto-generated customer_id (format: YN########C)
- Lead automatically created with status "lead"
- Redirected to customer dashboard
- Timeline visible with initial steps

**Test Data:**
```json
{
  "name": "Test Customer",
  "email": "testcustomer@example.com",
  "phone": "9123456789",
  "password": "SecurePass123!"
}
```

**Validation:**
- Check users table for new record
- Check leads table for auto-created lead
- Verify customer_id format
- Verify lead.source = "self"

---

### TC-AUTH-003: Invalid Login
**Priority:** High  
**Role:** Any

**Steps:**
1. Navigate to login page
2. Enter invalid credentials
3. Click login button

**Expected Result:**
- Login fails
- Error message displayed: "Invalid email or password"
- No JWT token generated
- User remains on login page

---

### TC-AUTH-004: Session Expiry
**Priority:** Medium  
**Role:** Any

**Steps:**
1. Login successfully
2. Wait for JWT expiration (default: 1 hour)
3. Attempt to access protected resource

**Expected Result:**
- 401 Unauthorized error
- Redirected to login page
- Session cleared

---

### TC-AUTH-005: Logout
**Priority:** High  
**Role:** Any

**Steps:**
1. Login successfully
2. Click logout button

**Expected Result:**
- Session cleared
- JWT token invalidated
- Redirected to login page
- Cannot access protected routes

---

## 2. Lead Management Tests

### TC-LEAD-001: Agent Creates Lead
**Priority:** Critical  
**Role:** Agent

**Steps:**
1. Login as agent
2. Navigate to "Create Lead" page
3. Fill in lead details
4. Submit form

**Expected Result:**
- Lead created successfully
- Lead.created_by = agent's user_id
- Lead.source = "agent"
- Lead.status = "lead"
- Timeline initialized with default steps
- Agent can view the lead in their leads list

**Test Data:**
```json
{
  "customer_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street, Mumbai",
  "notes": "Interested in 5kW system"
}
```

---

### TC-LEAD-002: Customer Self-Signup Creates Lead
**Priority:** Critical  
**Role:** Customer

**Steps:**
1. Customer signs up
2. Check leads table

**Expected Result:**
- Lead auto-created
- Lead.customer_account_id = customer's user_id
- Lead.created_by = customer's user_id
- Lead.source = "self"
- Lead.status = "lead"
- Lead.notes = "Auto-created lead from customer signup"

---

### TC-LEAD-003: Update Lead Status
**Priority:** High  
**Role:** Office/Admin

**Steps:**
1. Login as office user
2. Navigate to lead details
3. Change status from "lead" to "lead_interested"
4. Save changes

**Expected Result:**
- Status updated successfully
- Activity log entry created
- Notification sent to relevant users
- Updated timestamp reflects change

---

### TC-LEAD-004: Assign Installer to Lead
**Priority:** High  
**Role:** Office/Admin

**Steps:**
1. Login as office user
2. Navigate to lead details
3. Select installer from dropdown
4. Save assignment

**Expected Result:**
- Lead.installer_id updated
- Installer can now view the lead
- Notification sent to installer
- Activity log entry created

---

### TC-LEAD-005: Agent Cannot View Other Agent's Leads
**Priority:** Critical (Security)  
**Role:** Agent

**Steps:**
1. Login as Agent A
2. Create a lead
3. Logout
4. Login as Agent B
5. Try to access Agent A's lead

**Expected Result:**
- Agent B cannot see Agent A's lead in list
- Direct URL access returns 403 Forbidden
- RLS policy blocks access

---

### TC-LEAD-006: Customer Can Only View Own Lead
**Priority:** Critical (Security)  
**Role:** Customer

**Steps:**
1. Login as Customer A
2. Note their lead ID
3. Logout
4. Login as Customer B
5. Try to access Customer A's lead URL

**Expected Result:**
- Customer B cannot access Customer A's lead
- 403 Forbidden error
- RLS policy enforced

---

## 3. Document Management Tests

### TC-DOC-001: Upload Mandatory Document
**Priority:** Critical  
**Role:** Customer/Agent

**Steps:**
1. Login as customer
2. Navigate to documents section
3. Click "Upload Aadhaar Front"
4. Select file (PDF, < 9MB)
5. Upload

**Expected Result:**
- File uploaded to Supabase Storage
- Path: `leads/{lead_id}/mandatory/{uuid}.pdf`
- Document record created in database
- Document.status = "valid"
- Document.type = "mandatory"
- File size and MIME type recorded

**Test Data:**
- File: aadhaar_front.pdf
- Size: 2MB
- MIME: application/pdf

---

### TC-DOC-002: Upload File Exceeding Size Limit
**Priority:** High  
**Role:** Any

**Steps:**
1. Login
2. Try to upload file > 9MB

**Expected Result:**
- Upload rejected
- Error message: "File size exceeds 9MB limit"
- No storage consumed
- No database record created

---

### TC-DOC-003: Mark Document as Corrupted
**Priority:** High  
**Role:** Office/Admin

**Steps:**
1. Login as office user
2. Navigate to lead documents
3. View uploaded document
4. Click "Mark as Corrupted"
5. Confirm action

**Expected Result:**
- Document.status = "corrupted"
- Notification sent to customer
- Customer sees re-upload button
- Activity log entry created

---

### TC-DOC-004: Customer Re-uploads Corrupted Document
**Priority:** High  
**Role:** Customer

**Steps:**
1. Login as customer
2. See notification about corrupted document
3. Navigate to documents
4. Click re-upload button
5. Upload new file

**Expected Result:**
- New document uploaded
- Old document.status = "replaced"
- New document.status = "valid"
- Notification sent to office
- Timeline updated

---

### TC-DOC-005: Installer Uploads Installation Photos
**Priority:** High  
**Role:** Installer

**Steps:**
1. Login as installer
2. Navigate to assigned lead
3. Go to installation step
4. Upload photos

**Expected Result:**
- Files uploaded to `leads/{lead_id}/installation/`
- Document.type = "installation"
- Only installer and office/admin can view
- Customer cannot see installation photos (if configured)

---

## 4. Workflow/Timeline Tests

### TC-WORK-001: Initialize Lead Timeline
**Priority:** Critical  
**Role:** System

**Steps:**
1. Create new lead
2. Check lead_steps table

**Expected Result:**
- All steps from step_master created in lead_steps
- All steps.status = "upcoming"
- First step.status = "pending"
- Steps ordered by order_index

---

### TC-WORK-002: Complete Step (Office)
**Priority:** Critical  
**Role:** Office

**Steps:**
1. Login as office user
2. Navigate to lead timeline
3. Select pending step
4. Add remarks
5. Upload attachments (if required)
6. Click "Complete Step"

**Expected Result:**
- Step.status = "completed"
- Step.completed_by = office user_id
- Step.completed_at = current timestamp
- Next step.status = "pending"
- Activity log entry created
- Notification sent to relevant users

---

### TC-WORK-003: Complete Step Without Required Remarks
**Priority:** High  
**Role:** Office

**Steps:**
1. Login as office user
2. Select step with remarks_required = true
3. Try to complete without adding remarks

**Expected Result:**
- Validation error
- Error message: "Remarks are required for this step"
- Step not completed
- Status remains unchanged

---

### TC-WORK-004: Agent Cannot Complete Office-Only Step
**Priority:** Critical (Security)  
**Role:** Agent

**Steps:**
1. Login as agent
2. Navigate to lead timeline
3. Try to complete step with allowed_roles = ["office", "admin"]

**Expected Result:**
- Complete button disabled or hidden
- If API called directly: 403 Forbidden
- RLS policy blocks action
- Error message displayed

---

### TC-WORK-005: Admin Reorders Steps
**Priority:** Medium  
**Role:** Admin

**Steps:**
1. Login as admin
2. Navigate to Step Master
3. Drag and drop to reorder steps
4. Save changes

**Expected Result:**
- order_index values updated
- All existing leads reflect new order
- Timeline displays steps in new order
- No data loss

---

### TC-WORK-006: Admin Adds New Step
**Priority:** Medium  
**Role:** Admin

**Steps:**
1. Login as admin
2. Navigate to Step Master
3. Click "Add Step"
4. Fill in step details
5. Save

**Expected Result:**
- New step created in step_master
- Existing leads do NOT automatically get new step
- New leads will include new step
- order_index calculated correctly

---

### TC-WORK-007: Admin Deletes Step
**Priority:** Medium  
**Role:** Admin

**Steps:**
1. Login as admin
2. Navigate to Step Master
3. Select step with no lead_steps references
4. Click "Delete"
5. Confirm

**Expected Result:**
- Step deleted from step_master
- No orphaned lead_steps records
- Existing leads unaffected

---

### TC-WORK-008: Auto-Complete Lead on Final Step
**Priority:** High  
**Role:** Office

**Steps:**
1. Complete all steps except last
2. Complete final step

**Expected Result:**
- Final step completed
- Lead.status automatically changes to "lead_completed"
- Notification sent to customer
- Activity log entry created

---

## 5. Customer Profile Tests

### TC-PROF-001: Customer Fills PM Suryaghar Form
**Priority:** Critical  
**Role:** Customer

**Steps:**
1. Login as customer
2. Navigate to "Complete Profile"
3. Fill all required fields
4. Upload required documents
5. Submit form

**Expected Result:**
- customer_profiles record created
- All fields saved correctly
- Document paths stored
- Lead.status changes to "lead_processing"
- Timeline updated
- Notification sent to office

**Test Data:**
```json
{
  "name": "John Doe",
  "gender": "male",
  "address_line_1": "123 Main St",
  "pin_code": "400001",
  "state": "Maharashtra",
  "district": "Mumbai",
  "account_holder_name": "John Doe",
  "bank_account_number": "1234567890",
  "bank_name": "State Bank of India",
  "ifsc_code": "SBIN0001234"
}
```

---

### TC-PROF-002: Save Profile Draft
**Priority:** Medium  
**Role:** Customer

**Steps:**
1. Login as customer
2. Start filling profile form
3. Fill partial data
4. Click "Save Draft"

**Expected Result:**
- customer_profile_drafts record created
- draft_data contains partial form data
- Can resume later
- Draft auto-saved every 30 seconds

---

### TC-PROF-003: Resume from Draft
**Priority:** Medium  
**Role:** Customer

**Steps:**
1. Login as customer with existing draft
2. Navigate to profile form
3. Form pre-populated with draft data
4. Complete remaining fields
5. Submit

**Expected Result:**
- Draft data loaded correctly
- Can complete form
- Draft deleted after submission
- customer_profiles record created

---

### TC-PROF-004: Office Edits Customer Profile
**Priority:** High  
**Role:** Office

**Steps:**
1. Login as office user
2. Navigate to lead details
3. Click "Edit Profile"
4. Modify fields
5. Save

**Expected Result:**
- Profile updated
- Activity log entry created
- Customer notified of changes
- updated_at timestamp updated

---

## 6. Notification Tests

### TC-NOTIF-001: Step Completion Notification
**Priority:** High  
**Role:** System

**Steps:**
1. Office completes a step
2. Check notifications table

**Expected Result:**
- Notification created for customer
- Notification.type = "step_completion"
- Notification.read = false
- Customer sees notification in UI

---

### TC-NOTIF-002: Mark Notification as Read
**Priority:** Medium  
**Role:** Customer

**Steps:**
1. Login as customer
2. View notifications
3. Click on notification

**Expected Result:**
- Notification.read = true
- Notification badge count decreases
- Notification styling changes

---

### TC-NOTIF-003: Document Corruption Notification
**Priority:** High  
**Role:** System

**Steps:**
1. Office marks document as corrupted
2. Check customer notifications

**Expected Result:**
- Notification created
- Notification.type = "document_corruption"
- Message includes document name
- Link to re-upload page

---

## 7. Permission Tests

### TC-PERM-001: Admin Full Access
**Priority:** Critical  
**Role:** Admin

**Steps:**
1. Login as admin
2. Try to access all features

**Expected Result:**
- Can view all leads
- Can edit all leads
- Can modify step master
- Can create/disable users
- Can access all documents
- Can override any permission

---

### TC-PERM-002: Agent Limited Access
**Priority:** Critical  
**Role:** Agent

**Steps:**
1. Login as agent
2. Try to access various features

**Expected Result:**
- Can only view own leads
- Cannot view other agents' leads
- Cannot modify step master
- Cannot create users
- Can upload documents for own leads
- Cannot access admin dashboard

---

### TC-PERM-003: Customer Read-Only Timeline
**Priority:** High  
**Role:** Customer

**Steps:**
1. Login as customer
2. Navigate to timeline
3. Try to modify step status

**Expected Result:**
- Timeline visible
- All steps displayed
- Cannot mark steps as complete
- Cannot modify remarks
- Can only upload documents when prompted

---

### TC-PERM-004: Installer Assigned Leads Only
**Priority:** High  
**Role:** Installer

**Steps:**
1. Login as installer
2. View leads list

**Expected Result:**
- Only sees leads where installer_id = own user_id
- Cannot see unassigned leads
- Cannot see leads assigned to other installers
- Can update installation steps
- Can upload installation photos

---

## 8. Edge Cases & Error Handling

### TC-EDGE-001: Duplicate Phone Number Signup
**Priority:** High  
**Role:** Customer

**Steps:**
1. Customer A signs up with phone: 9876543210
2. Customer B tries to sign up with same phone

**Expected Result:**
- Signup fails
- Error message: "Phone number already registered"
- No duplicate user created
- Existing lead linked if applicable

---

### TC-EDGE-002: Invalid Phone Number Format
**Priority:** Medium  
**Role:** Any

**Steps:**
1. Try to create user/lead with invalid phone
2. Examples: "123", "0123456789", "abc1234567"

**Expected Result:**
- Validation error
- Error message: "Phone must be 10 digits starting with 1-9"
- No record created

---

### TC-EDGE-003: Concurrent Step Completion
**Priority:** Medium  
**Role:** Multiple Users

**Steps:**
1. User A starts completing step
2. User B completes same step simultaneously
3. User A submits

**Expected Result:**
- First submission succeeds
- Second submission fails or shows "already completed"
- No data corruption
- Activity log shows both attempts

---

### TC-EDGE-004: Delete Lead with Documents
**Priority:** High  
**Role:** Admin

**Steps:**
1. Create lead with uploaded documents
2. Try to delete lead

**Expected Result:**
- Cascade delete or prevent deletion
- If cascade: documents also deleted from storage
- If prevent: error message with instructions
- No orphaned records

---

### TC-EDGE-005: Network Failure During Upload
**Priority:** Medium  
**Role:** Any

**Steps:**
1. Start file upload
2. Disconnect network mid-upload
3. Reconnect

**Expected Result:**
- Upload fails gracefully
- Error message displayed
- Can retry upload
- No partial files in storage
- No database records for failed upload

---

## 9. Performance Tests

### TC-PERF-001: Load 1000 Leads
**Priority:** Medium  
**Role:** Office

**Steps:**
1. Create 1000 test leads
2. Login as office user
3. Navigate to leads list
4. Measure load time

**Expected Result:**
- Page loads in < 3 seconds
- Pagination works correctly
- Filters work correctly
- No browser freeze

---

### TC-PERF-002: Upload 10 Documents Simultaneously
**Priority:** Medium  
**Role:** Customer

**Steps:**
1. Select 10 documents
2. Upload all at once

**Expected Result:**
- All uploads complete successfully
- Progress indicators work
- No timeout errors
- All documents recorded in database

---

### TC-PERF-003: Timeline with 50 Steps
**Priority:** Low  
**Role:** Customer

**Steps:**
1. Create lead with 50 steps
2. View timeline

**Expected Result:**
- Timeline renders in < 2 seconds
- All steps visible
- Scrolling smooth
- No UI lag

---

## 10. Integration Tests

### TC-INT-001: End-to-End Customer Journey
**Priority:** Critical  
**Role:** Multiple

**Steps:**
1. Customer signs up
2. Fills profile form
3. Uploads documents
4. Office reviews and approves
5. Installer assigned
6. Installation completed
7. Subsidy applied
8. Project closed

**Expected Result:**
- All steps complete successfully
- Status transitions correctly
- Notifications sent at each stage
- Activity log complete
- Final status = "lead_completed"

---

### TC-INT-002: Agent to Customer Handoff
**Priority:** High  
**Role:** Agent, Customer

**Steps:**
1. Agent creates lead with customer phone
2. Customer signs up with same phone
3. System links accounts

**Expected Result:**
- Lead.customer_account_id updated
- Customer can now view lead
- Agent still has access
- No duplicate leads created

---

## Test Execution Summary Template

```markdown
## Test Run: [Date]

**Environment:** Production/Staging/Development  
**Tester:** [Name]  
**Build Version:** [Version]

### Results

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-AUTH-001 | Admin Login | ✅ Pass | |
| TC-AUTH-002 | Customer Signup | ❌ Fail | Customer ID not generated |
| TC-LEAD-001 | Agent Creates Lead | ⚠️ Partial | Timeline not initialized |

### Summary
- Total Tests: 50
- Passed: 45
- Failed: 3
- Partial: 2
- Pass Rate: 90%

### Critical Issues
1. Customer ID generation failing
2. Timeline initialization broken

### Next Steps
1. Fix customer ID generation
2. Debug timeline initialization
3. Re-run failed tests
```

---

*Last Updated: November 27, 2025*
