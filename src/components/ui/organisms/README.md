# Organism Components - Penpot Design System

Organism components are complex UI sections built from molecules and atoms following atomic design principles.

## Components

### Header
Complex navigation component combining logo, menu items, search, and user profile.

### DataTable
Advanced table component with sorting, filtering, and pagination capabilities.

### Modal
Dialog component with overlay, header, content, and action buttons.

### Card
Reusable card layout combining headers, content areas, and action buttons.

### FormSection
Complete form component combining multiple form fields, sections, and submit actions.

## Usage

```tsx
import { Header, DataTable, Modal, Card, FormSection } from '@/components/ui/organisms';
```

## Design Principles

- Organisms compose molecules and atoms
- Never use higher-level components within organisms
- Follow Penpot design system tokens for styling
- Maintain accessibility standards (WCAG AA)
- Support responsive breakpoints

## Validation

All organism components validate:
- Requirements 4.1-4.5 (Organism creation)
- Requirements 10.1-10.5 (Accessibility)
- Requirements 11.1-11.5 (Penpot design accuracy)
