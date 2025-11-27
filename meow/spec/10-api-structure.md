# API Structure

## Auth
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/logout`

## Lead
- `POST /leads` - Create new lead
- `GET /leads` - List leads (filtered by role)
- `GET /leads/:id` - Get lead details
- `PATCH /leads/:id` - Update lead

## Documents
- `POST /leads/:id/documents/upload-link` - Get signed upload URL
- `GET /leads/:id/documents` - List documents for lead
- `PATCH /leads/:id/documents/:doc_id` - Mark document as corrupted
- `DELETE /leads/:id/documents/:doc_id` - Delete document (admin only)

## Steps
- `GET /steps` - List all steps from step_master
- `POST /steps` - Create new step (admin only)
- `PATCH /steps/:id` - Update step (admin only)
- `DELETE /steps/:id` - Delete step (admin only)
- `PUT /steps/reorder` - Reorder steps (admin only)

## Lead Steps
- `POST /leads/:id/steps/:step_id/complete` - Mark step as completed
- `PATCH /leads/:id/steps/:step_id/edit` - Edit step remarks/attachments
- `POST /leads/:id/steps/:step_id/reopen` - Reopen completed step (admin only)

## Activity Log
- `GET /leads/:id/activity` - Get activity log for lead

## Dashboard
- `GET /dashboard/stats` - Get dashboard statistics (role-based)
- `GET /dashboard/recent-leads` - Get recent leads
