# Forms Components

This directory contains reusable form components for the Solar CRM application.

## Components

### PMSuryagharForm

A multi-step form component for collecting PM Suryaghar scheme application data.

**Features:**
- Multi-step wizard interface (4 steps)
- Form validation using Zod
- Progress indicator
- Review step before submission
- Responsive design

**Usage:**

```tsx
import { PMSuryagharForm } from '@/components/forms';

function MyComponent() {
  const handleSubmit = async (data: PMSuryagharFormData) => {
    const response = await fetch(`/api/leads/${leadId}/pm-suryaghar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      // Handle success
    }
  };

  return (
    <PMSuryagharForm
      leadId="lead-uuid"
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}
```

**Props:**
- `leadId` (string, required): The UUID of the lead
- `initialData` (Partial<PMSuryagharFormData>, optional): Pre-fill form data
- `onSubmit` (function, required): Callback when form is submitted
- `onCancel` (function, optional): Callback when cancel is clicked

**Steps:**
1. Applicant Information (name, phone, email)
2. Property Details (address, property type, roof type, roof area, KW requirement)
3. Financial Information (Aadhar, PAN, bank account, IFSC)
4. Review & Submit

### FormProgress

A progress indicator component for multi-step forms.

**Usage:**

```tsx
import { FormProgress } from '@/components/forms';

<FormProgress
  currentStep={0}
  totalSteps={4}
  steps={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
/>
```

### FormSection

A reusable section wrapper for form fields with title and description.

**Usage:**

```tsx
import { FormSection } from '@/components/forms';

<FormSection
  title="Personal Information"
  description="Enter your personal details"
>
  {/* Form fields */}
</FormSection>
```

## API Integration

The PM Suryaghar form integrates with the following API endpoint:

- `POST /api/leads/[id]/pm-suryaghar` - Create new form
- `GET /api/leads/[id]/pm-suryaghar` - Get existing form
- `PATCH /api/leads/[id]/pm-suryaghar` - Update existing form

## Validation

Form validation is handled by Zod with the following rules:

- **Applicant Name**: Required, minimum 1 character
- **Phone**: Required, 10-15 characters
- **Email**: Optional, must be valid email format
- **Property Address**: Required, minimum 5 characters
- **Property Type**: Required (residential/commercial/industrial)
- **Roof Type**: Required (flat/sloped/mixed)
- **Roof Area**: Optional, must be positive number
- **KW Requirement**: Required, must be positive number
- **Aadhar Number**: Required, must be exactly 12 digits
- **PAN Number**: Required, must match format ABCDE1234F
- **Bank Account**: Required, 9-18 characters
- **IFSC Code**: Required, must match format ABCD0123456

## Requirements

This component implements the following requirements:
- 5.1: PM Suryaghar form data persistence
- 5.2: Form submission metadata recording
- 5.3: Combined status transition
- 5.4: Agent form submission permission
- 5.5: Customer form submission permission
