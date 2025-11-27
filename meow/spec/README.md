# Solar CRM - Specification Documentation

This directory contains the complete technical specification for the Solar CRM system, broken down into focused, digestible documents for efficient LLM context usage.

## Document Structure

### Core System
- **00-overview.md** - System overview, purpose, and technology stack
- **01-roles-permissions.md** - Detailed role definitions and permission matrix
- **02-lead-management.md** - Lead creation, status, and customer linking
- **03-document-management.md** - Document types, storage, and upload flows
- **05-timeline-workflow.md** - Timeline system and workflow engine

### Technical Implementation
- **06-database-schema.md** - Complete database schema and table structures
- **07-security-rls.md** - Security model and Row-Level Security policies
- **08-supabase-backend.md** - Supabase architecture and Edge Functions
- **09-nextjs-frontend.md** - Next.js frontend structure and routing
- **10-api-structure.md** - API endpoints and structure
- **11-complete-flow.md** - End-to-end user flows and journeys
- **12-deployment.md** - Deployment strategy and configuration

## Quick Reference

### For Understanding Business Logic
Start with: `00-overview.md` → `01-roles-permissions.md` → `11-complete-flow.md`

### For Database Work
Start with: `06-database-schema.md` → `07-security-rls.md`

### For Frontend Development
Start with: `09-nextjs-frontend.md` → `10-api-structure.md`

### For Backend Development
Start with: `08-supabase-backend.md` → `07-security-rls.md`

### For Document/Storage Features
Start with: `03-document-management.md` → `08-supabase-backend.md`

### For Timeline/Workflow Features
Start with: `05-timeline-workflow.md` → `06-database-schema.md`

## Usage Tips

1. **Token Efficiency**: Each file is focused on a specific aspect, reducing token usage
2. **Context Relevance**: Reference only the files needed for your current task
3. **Cross-References**: Files reference each other where needed for complete understanding
4. **Incremental Learning**: Build understanding progressively from overview to details

## Project Information

- **Project ID**: gqalreoyglltniepgnnr
- **Organization ID**: ommnvbhaevcwxumliojo
- **Backend**: Supabase
- **Frontend**: Next.js (App Router)
- **Database**: PostgreSQL with RLS
