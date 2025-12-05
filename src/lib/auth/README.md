# NextAuth Integration

This directory contains the NextAuth (Auth.js v5) configuration for the YAS Natural Solar CRM application.

## Files

- `config.ts` - NextAuth configuration with Supabase integration
- `auth.ts` - NextAuth instance and exported handlers
- `index.ts` - Convenience exports for the auth module
- `../app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Generate a secure secret with:
```bash
openssl rand -base64 32
```

### 2. Configuration

The NextAuth configuration uses:
- **Credentials Provider**: Email/password authentication
- **Supabase Database**: User data stored in Supabase `users` table
- **JWT Strategy**: Session tokens stored in HTTP-only cookies
- **Session Duration**: 7 days

### 3. Usage

#### Server Components

```typescript
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Welcome {session.user.name}</div>;
}
```

#### Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome {session.user.name}</div>;
}
```

#### API Routes

```typescript
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Use session.user.id for queries
  return Response.json({ user: session.user });
}
```

## Authentication Flow

1. User submits credentials via login form
2. NextAuth validates against Supabase users table
3. Password verified using Supabase Auth
4. Session created with JWT token in HTTP-only cookie
5. User redirected to role-appropriate dashboard

## Session Data

The session includes:
- `id` - User UUID
- `email` - User email address
- `name` - User full name
- `role` - User role (admin, agent, office, installer, customer)
- `status` - Account status (active, disabled)

## Security

- Passwords hashed with bcrypt
- HTTP-only cookies prevent XSS
- Secure flag enabled in production
- SameSite=Lax prevents CSRF
- 7-day session expiration
- Automatic token refresh

## Supabase Integration

NextAuth integrates with existing Supabase infrastructure:
- User data stored in `users` table
- RLS policies enforced on all queries
- Compatible with existing database schema
- No schema changes required
