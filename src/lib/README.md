# Lib Directory

This directory contains utility functions, API clients, and shared business logic.

## Structure

- `utils.ts` - Utility functions (cn helper for Tailwind classes)
- `supabase/` - Supabase client configuration
  - `client.ts` - Client-side Supabase client
  - `server.ts` - Server-side Supabase client
  - `middleware.ts` - Auth middleware
- `api/` - API client functions
  - `leads.ts` - Lead CRUD operations
  - `documents.ts` - Document operations
  - `steps.ts` - Timeline step operations
- `errors/` - Error handling utilities
- `middleware/` - Custom middleware functions

## Usage

Import utilities using the `@/lib` alias:

```typescript
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
```
