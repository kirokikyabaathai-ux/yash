# System Overview

## Purpose
A Solar CRM system for managing the complete lifecycle of solar rooftop installations from lead generation to project closure.

## Key Actors
- **Agents**: Generate leads
- **Customers**: Self-signup or track their lead
- **Office Team**: Process leads through installation steps
- **Installers**: Update installation-related tasks
- **Admin**: Full superuser access

## Core Features
- Timeline tracking for all project steps
- Document management with secure storage
- Supabase storage with signed URLs for security
- Lead linking logic for customer accounts
- Role-based permissions

## Project Flow
Lead → Survey → Proposal → Payment/Loan → Installation → Net Meter → Subsidy → Closure

## Technology Stack
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Frontend**: Next.js (App Router)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Storage**: Supabase Storage with signed URLs
