# Solar CRM Project Structure

## Overview

This Next.js 14+ application uses the App Router with TypeScript and is configured with all necessary dependencies for the Solar CRM system.

**Architecture: Fully Serverless with Anon Key Only**

This is a serverless application where:
- **Frontend**: Next.js serves as the frontend (deployed on Vercel)
- **Backend**: Supabase provides all backend services (Auth, Database, Storage, Edge Functions)
- **Security**: All Next.js code uses ONLY the Supabase anon key with user sessions
- **Authorization**: All permissions enforced by RLS policies at the database level
- **Service Role Key**: Used ONLY in Supabase Edge Functions and tests, NEVER in Next.js code

## Technology Stack

### Frontend
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library (New York style)
- **Lucide React** - Icon library

### Forms & Validation
- **React Hook Form 7.66.1** - Form state management
- **Zod 4.1.12** - Schema validation

### Backend Integration
- **@supabase/supabase-js 2.84.0** - Supabase client
- **@supabase/auth-helpers-nextjs 0.10.0** - Next.js auth helpers
- **@supabase/ssr 0.7.0** - Server-side rendering support

### Testing
- **Jest 30.2.0** - Testing framework
- **@testing-library/react 16.3.0** - React testing utilities
- **@testing-library/jest-dom 6.9.1** - DOM matchers
- **fast-check 4.3.0** - Property-based testing
- **ts-jest 29.4.5** - TypeScript support for Jest

## Directory Structure

```
yasnaturals/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components (auto-generated)
│   │   ├── auth/              # Authentication components
│   │   ├── leads/             # Lead management components
│   │   ├── documents/         # Document management components
│   │   ├── timeline/          # Timeline components
│   │   ├── forms/             # Form components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── notifications/     # Notification components
│   │   └── admin/             # Admin components
│   ├── lib/                   # Utility functions and API clients
│   │   ├── utils.ts           # Utility functions (cn helper)
│   │   ├── supabase/          # Supabase client configuration
│   │   ├── api/               # API client functions
│   │   ├── errors/            # Error handling
│   │   └── middleware/        # Custom middleware
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useLeads.ts        # Lead operations hook
│   │   └── useSupabase.ts     # Supabase client hook
│   └── types/                 # TypeScript type definitions
│       ├── database.ts        # Database types
│       ├── api.ts             # API types
│       ├── auth.ts            # Auth types
│       └── leads.ts           # Lead types
├── supabase/                  # Supabase configuration
│   ├── models/                # Database table schemas
│   ├── rpc/                   # RPC functions
│   ├── storage/               # Storage configuration
│   ├── edge-functions/        # Edge functions
│   └── config/                # RLS policies
├── __tests__/                 # Test files
├── public/                    # Static assets
├── .kiro/                     # Kiro configuration
│   └── specs/                 # Feature specifications
│       └── solar-crm/         # Solar CRM spec
├── components.json            # shadcn/ui configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── jest.config.js             # Jest configuration
└── package.json               # Dependencies

```

## Path Aliases

The following path aliases are configured in `tsconfig.json`:

- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/lib` → `./src/lib`
- `@/hooks` → `./src/hooks`
- `@/types` → `./src/types`
- `@/ui` → `./src/components/ui`

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Next Steps

1. Configure Supabase client utilities (Task 9)
2. Implement authentication module (Task 10)
3. Build lead management features (Task 11)
4. Add document management (Task 13)
5. Implement timeline workflow (Task 15)

## Development Guidelines

- Use TypeScript for all new files
- Follow the component structure defined in the design document
- Use shadcn/ui components for consistent UI
- Implement proper error handling
- Write tests for critical functionality
- Use React Hook Form with Zod for form validation
- Follow Next.js App Router best practices
