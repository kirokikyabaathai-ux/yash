# Materials Management Components

This directory contains components for managing materials in the solar installation workflow.

## Components

### MaterialsCatalog
**Purpose**: Admin interface for managing the master materials catalog

**Features**:
- View all available materials
- Add new materials to catalog
- Search and filter by category
- Categorize materials (panel, inverter, structure, cable, accessory, other)
- Specify units of measurement

**Usage**:
```tsx
import { MaterialsCatalog } from '@/components/materials';

<MaterialsCatalog />
```

**Permissions**: Admin only

---

### MaterialsConfiguration
**Purpose**: Configure required materials for a specific lead

**Features**:
- Select materials from master catalog
- Specify required quantities for each material
- Search materials
- Visual feedback for selected materials
- Automatically creates verification entries

**Usage**:
```tsx
import { MaterialsConfiguration } from '@/components/materials';

<MaterialsConfiguration 
  leadId="lead-uuid"
  onComplete={() => console.log('Configuration saved')}
/>
```

**Props**:
- `leadId` (string, required): The lead ID
- `onComplete` (function, optional): Callback when configuration is saved

**Permissions**: Admin only

**Workflow Step**: "Good Despatch" (order_index: 9000)

---

### MaterialsVerification
**Purpose**: Verify materials received for a lead

**Features**:
- View all configured materials with required quantities
- Input received quantities
- Select verification status (verified, quantity_mismatch, missing, damaged)
- Add remarks for issues
- Real-time status summary
- Visual indicators for completion status

**Usage**:
```tsx
import { MaterialsVerification } from '@/components/materials';

// Editable mode
<MaterialsVerification 
  leadId="lead-uuid"
  onComplete={() => console.log('All verified')}
/>

// Read-only mode
<MaterialsVerification 
  leadId="lead-uuid"
  readOnly={true}
/>
```

**Props**:
- `leadId` (string, required): The lead ID
- `onComplete` (function, optional): Callback when all materials are verified
- `readOnly` (boolean, optional): Display in read-only mode

**Permissions**: Admin, Office, Installer (for their assigned leads)

**Workflow Step**: "Goods Received In Godown" (order_index: 10000)

---

## Workflow Integration

### Step 1: Admin Adds Materials to Catalog
Navigate to `/admin/materials` to manage the master catalog.

### Step 2: Admin Configures Materials for Lead
When a lead reaches "Good Despatch" step:
1. Navigate to `/admin/leads/[leadId]/materials`
2. Select materials and specify quantities
3. Save configuration

### Step 3: Verification
When materials arrive at "Goods Received In Godown" step:
1. Navigate to `/office/leads/[leadId]/materials-verification`
2. Verify each material
3. If all verified → can proceed to next step
4. If issues → workflow halts, remarks required

### Step 4: Status Check
The system automatically checks if all materials are verified before allowing step completion.

---

## Database Functions Used

- `get_materials_catalog()` - Get master materials list
- `add_material_to_catalog()` - Add new material
- `configure_lead_materials()` - Configure materials for lead
- `get_lead_materials_with_verification()` - Get materials with verification status
- `verify_lead_materials()` - Save verification results
- `check_materials_verification_status()` - Check if can proceed

---

## Verification Statuses

- **pending**: Not yet verified (default)
- **verified**: Correct quantity received ✓
- **quantity_mismatch**: Wrong quantity received (requires remarks)
- **missing**: Material not received (requires remarks)
- **damaged**: Material received but damaged (requires remarks)

---

## Material Categories

- **panel**: Solar panels
- **inverter**: Inverters and related equipment
- **structure**: Mounting structures
- **cable**: Cables and wiring
- **accessory**: Accessories and small parts
- **other**: Miscellaneous items

---

## Units of Measurement

- **pcs**: Pieces
- **meter**: Meters
- **kg**: Kilograms
- **set**: Sets
- **roll**: Rolls
- **box**: Boxes

---

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components (Card, Button, Input, etc.)
- Responsive design (mobile-first)
- Dark mode support
- Consistent color coding for categories and statuses

---

## Error Handling

All components include:
- Loading states
- Error messages via toast notifications
- Form validation
- Empty states
- Disabled states during submission

---

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliance
