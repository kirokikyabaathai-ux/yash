# Types Directory

This directory contains TypeScript type definitions and interfaces for the application.

## Structure

- `database.ts` - Database table types (generated from Supabase schema)
- `api.ts` - API request/response types
- `auth.ts` - Authentication types
- `leads.ts` - Lead-related types
- `documents.ts` - Document types
- `timeline.ts` - Timeline and step types
- `forms.ts` - Form data types
- `notifications.ts` - Notification types

## Usage

Import types using the `@/types` alias:

```typescript
import type { Lead, LeadFilters } from '@/types/leads';
import type { User, AuthSession } from '@/types/auth';
```

## Best Practices

- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and mapped types
- Export all types for reusability
- Keep types close to their usage domain
