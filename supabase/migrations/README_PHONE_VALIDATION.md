# Phone Number Validation

## Database Constraint

Phone numbers in the system must follow these rules:
- **Exactly 10 digits**
- **Cannot start with 0**
- **Format:** `9876543210`

## Implementation

### Database Level
- Migration: `20251127000000_add_phone_number_validation.sql`
- Tables affected: `users`, `leads`
- Constraint: `check_phone_format`
- Regex: `^[1-9][0-9]{9}$`

### Normalization Function
The migration includes a `normalize_phone()` function that:
- Removes country codes (+91, +1)
- Removes special characters
- Removes leading zeros
- Ensures exactly 10 digits

### Frontend Validation
Updated in:
- `src/lib/errors/error-handler.ts` - `validatePhone()` function
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/CustomerSignupForm.tsx`
- `src/components/leads/LeadForm.tsx`
- `src/components/admin/UserForm.tsx`
- `src/app/api/auth/signup/route.ts`

## Examples

### Valid Phone Numbers
- `9876543210` ✅
- `8123456789` ✅
- `7000000000` ✅

### Invalid Phone Numbers
- `0123456789` ❌ (starts with 0)
- `987654321` ❌ (only 9 digits)
- `98765432100` ❌ (11 digits)
- `+919876543210` ❌ (has country code - will be normalized)

## User ID Generation

When users are created, they automatically receive a visible ID:
- **Agents:** `YN12345678W`
- **Offices:** `YN12345678W`
- **Customers:** `YN12345678C`

This is handled by the trigger in `20251127000000_add_user_id_generation.sql`.
