# User Roles and Permissions

## Role Hierarchy
1. Admin (Superuser)
2. Office Team
3. Agent
4. Installer
5. Customer

---

## Admin (Superuser)

### Capabilities
- Create/disable/edit all accounts (Agent, Office, Installer, Customer)
- Create/Edit/Delete all timeline steps
- Assign step permissions (admin only, office + admin, installer only, customer upload, agent upload)
- Edit any lead
- Override any permission
- Delete or replace any document
- Mark any step completed
- Move timeline backward
- Skip steps
- View all dashboards
- Access entire Supabase storage via signed URLs
- Review and resolve document corruption
- Full audit log visibility

**Admin = Full unrestricted access to the entire system**

---

## Agent

### Can Do
- Create leads
- Upload mandatory + optional documents (only for own leads)
- View own leads only
- See timeline (read-only unless admin provides special permission)

### Cannot Do
- Modify steps (unless admin allows on specific steps)
- Modify other users' leads
- View admin/office dashboards
- Change lead assignment

---

## Office Team

### Can Do
- View all leads
- Upload documents for any lead
- Update timeline steps (if allowed by admin)
- Schedule and complete surveys
- Send proposals
- Mark payments
- Update loan status
- Schedule installation
- Mark net meter process
- Complete commissioning
- Apply subsidy
- Close project

### Cannot Do
- Modify Step Master
- Create admin users
- Override admin-only restricted steps

---

## Installer

### Can Do
- View only installation-assigned leads
- Upload installation photos
- Update installation progress steps
- Complete installation step
- Submit installation certificate

### Cannot See
- Financial details
- Survey details
- Office/Admin dashboards

---

## Customer

### Can Do
- Create account
- Login
- View full timeline
- Upload missing/corrupted documents
- View proposal, payments, status

### Cannot Do
- Modify step status
- Replace office/admin uploads
- Edit lead fields
- Delete leads
