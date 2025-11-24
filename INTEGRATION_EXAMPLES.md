# UI Polish Integration Examples

This document shows how to integrate the new UI polish components into existing components.

## Example 1: Adding Loading States to Forms

### Before:
```tsx
export function LeadForm({ onSubmit, isLoading }) {
  return (
    <form onSubmit={handleSubmit}>
      <input name="customer_name" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### After:
```tsx
import { LoadingButton } from "@/components/ui/loading-button";
import { FormSkeleton } from "@/components/ui/skeleton-loaders";

export function LeadForm({ onSubmit, isLoading, isLoadingData }) {
  if (isLoadingData) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="customer_name" />
      <LoadingButton type="submit" loading={isLoading}>
        Save
      </LoadingButton>
    </form>
  );
}
```

## Example 2: Adding Toast Notifications

### Before:
```tsx
const handleSubmit = async (data) => {
  try {
    await createLead(data);
    alert('Lead created successfully');
  } catch (error) {
    alert('Error creating lead');
  }
};
```

### After:
```tsx
import { toast } from "@/lib/toast";

const handleSubmit = async (data) => {
  try {
    await createLead(data);
    toast.success('Lead created successfully', 'The lead has been added to your pipeline');
  } catch (error) {
    toast.error('Error creating lead', error.message);
  }
};

// Or use promise-based toast:
const handleSubmit = async (data) => {
  await toast.promise(
    createLead(data),
    {
      loading: 'Creating lead...',
      success: 'Lead created successfully!',
      error: (err) => `Error: ${err.message}`,
    }
  );
};
```

## Example 3: Adding Confirmation Dialogs

### Before:
```tsx
const handleDelete = async (id) => {
  if (window.confirm('Are you sure?')) {
    await deleteLead(id);
  }
};
```

### After:
```tsx
import { useConfirm } from "@/hooks/use-confirm";

function LeadList() {
  const { confirm, ConfirmationDialog } = useConfirm();

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: 'Delete Lead',
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (confirmed) {
      await deleteLead(id);
      toast.success('Lead deleted successfully');
    }
  };

  return (
    <>
      {/* Your component JSX */}
      <ConfirmationDialog />
    </>
  );
}
```

## Example 4: Adding Skeleton Loaders

### Before:
```tsx
function LeadList({ leads, isLoading }) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
    </div>
  );
}
```

### After:
```tsx
import { LeadListSkeleton } from "@/components/ui/skeleton-loaders";

function LeadList({ leads, isLoading }) {
  if (isLoading) {
    return <LeadListSkeleton />;
  }

  return (
    <div>
      {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
    </div>
  );
}
```

## Example 5: Improving Accessibility

### Before:
```tsx
<button onClick={handleDelete}>
  <TrashIcon />
</button>
```

### After:
```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden";

<button onClick={handleDelete} aria-label="Delete lead">
  <TrashIcon aria-hidden="true" />
  <VisuallyHidden>Delete lead</VisuallyHidden>
</button>
```

## Example 6: Adding Upload Progress

### Before:
```tsx
const handleUpload = async (file) => {
  await uploadFile(file);
};
```

### After:
```tsx
import { UploadProgress } from "@/components/ui/upload-progress";
import { toast } from "@/lib/toast";

function DocumentUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed', error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      {isUploading && (
        <UploadProgress 
          progress={uploadProgress} 
          fileName={file.name} 
        />
      )}
      {/* Upload UI */}
    </div>
  );
}
```

## Example 7: Using Accessible Form Fields

### Before:
```tsx
<div>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" />
  {errors.email && <span>{errors.email}</span>}
</div>
```

### After:
```tsx
import { AccessibleFormField } from "@/components/ui/accessible-form-field";

<AccessibleFormField
  label="Email Address"
  error={errors.email}
  hint="We'll never share your email with anyone"
  required
>
  <input type="email" />
</AccessibleFormField>
```

## Example 8: Adding Keyboard Shortcuts

### Before:
```tsx
function LeadDetail() {
  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### After:
```tsx
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

function LeadDetail() {
  useKeyboardShortcut({ key: 's', ctrl: true }, handleSave);
  useKeyboardShortcut({ key: 'd', ctrl: true, shift: true }, handleDelete);

  return (
    <div>
      <button onClick={handleSave}>
        Save <span className="text-muted-foreground text-xs">(Ctrl+S)</span>
      </button>
      <button onClick={handleDelete}>
        Delete <span className="text-muted-foreground text-xs">(Ctrl+Shift+D)</span>
      </button>
    </div>
  );
}
```

## Example 9: Using Specialized Confirmation Dialogs

### Before:
```tsx
const handleMarkCorrupted = async (docId) => {
  if (window.confirm('Mark as corrupted?')) {
    await markDocumentCorrupted(docId);
  }
};
```

### After:
```tsx
import { DocumentCorruptionDialog } from "@/components/ui/document-corruption-dialog";
import { toast } from "@/lib/toast";

function DocumentManager() {
  const [corruptDialogOpen, setCorruptDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleMarkCorrupted = async () => {
    try {
      await markDocumentCorrupted(selectedDoc.id);
      toast.success('Document marked as corrupted', 'User will be notified to re-upload');
    } catch (error) {
      toast.error('Failed to mark document', error.message);
    }
  };

  return (
    <>
      <button onClick={() => {
        setSelectedDoc(doc);
        setCorruptDialogOpen(true);
      }}>
        Mark as Corrupted
      </button>

      <DocumentCorruptionDialog
        open={corruptDialogOpen}
        onOpenChange={setCorruptDialogOpen}
        onConfirm={handleMarkCorrupted}
        documentName={selectedDoc?.file_name}
      />
    </>
  );
}
```

## Example 10: Complete Component Integration

Here's a complete example showing multiple enhancements:

```tsx
'use client';

import { useState } from 'react';
import { LoadingButton } from "@/components/ui/loading-button";
import { LeadListSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { AccessibleFormField } from "@/components/ui/accessible-form-field";

export function EnhancedLeadForm({ lead, onSubmit, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ /* ... */ });
  const [errors, setErrors] = useState({});
  const { confirm, ConfirmationDialog } = useConfirm();

  // Add keyboard shortcut for save
  useKeyboardShortcut({ key: 's', ctrl: true }, handleSubmit);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Lead saved successfully', 'The lead has been updated');
      onCancel();
    } catch (error) {
      toast.error('Failed to save lead', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const confirmed = await confirm({
        title: 'Discard Changes',
        description: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'destructive',
      });

      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AccessibleFormField
          label="Customer Name"
          error={errors.customer_name}
          required
        >
          <input
            type="text"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          />
        </AccessibleFormField>

        <AccessibleFormField
          label="Phone Number"
          error={errors.phone}
          hint="10-15 digits"
          required
        >
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </AccessibleFormField>

        <div className="flex gap-2">
          <LoadingButton type="submit" loading={isLoading}>
            Save (Ctrl+S)
          </LoadingButton>
          <button type="button" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>

      <ConfirmationDialog />
    </>
  );
}
```

## Testing Your Enhancements

After integrating these components, test:

1. **Loading States**: Verify skeleton loaders appear during data fetching
2. **Notifications**: Check that toasts appear and dismiss correctly
3. **Confirmations**: Test that dialogs prevent accidental actions
4. **Accessibility**: 
   - Test keyboard navigation (Tab, Enter, Escape)
   - Test with screen reader (NVDA, JAWS, VoiceOver)
   - Verify ARIA labels are announced
   - Check focus indicators are visible
5. **Keyboard Shortcuts**: Verify shortcuts work as expected
6. **Mobile**: Test on mobile devices for touch targets and responsiveness

## Next Steps

1. Gradually integrate these components into existing pages
2. Update API calls to use toast notifications
3. Replace window.confirm with confirmation dialogs
4. Add loading states to all data fetching
5. Improve form accessibility with AccessibleFormField
6. Add keyboard shortcuts to frequently used actions
7. Test thoroughly with keyboard and screen readers
