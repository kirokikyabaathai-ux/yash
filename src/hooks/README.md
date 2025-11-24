# Hooks Directory

This directory contains custom React hooks for shared logic across components.

## Structure

- `useAuth.ts` - Authentication state and operations
- `useLeads.ts` - Lead data fetching and mutations
- `useDocuments.ts` - Document operations
- `useTimeline.ts` - Timeline state management
- `useNotifications.ts` - Notification management
- `useSupabase.ts` - Supabase client access

## Usage

Import hooks using the `@/hooks` alias:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
```

## Best Practices

- Keep hooks focused on a single responsibility
- Use TypeScript for type safety
- Include proper error handling
- Document hook parameters and return values
