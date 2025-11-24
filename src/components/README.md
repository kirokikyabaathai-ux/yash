# Components Directory

This directory contains reusable React components organized by feature.

## Structure

- `ui/` - shadcn/ui components (auto-generated)
- `auth/` - Authentication components (LoginForm, SignupForm, etc.)
- `leads/` - Lead management components
- `documents/` - Document management components
- `timeline/` - Timeline and workflow components
- `forms/` - Form components (PM Suryaghar form, etc.)
- `dashboard/` - Dashboard components
- `notifications/` - Notification components
- `admin/` - Admin-specific components

## Usage

Components should be imported using the `@/components` alias:

```typescript
import { Button } from '@/components/ui/button';
import { LeadList } from '@/components/leads/LeadList';
```
