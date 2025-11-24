# UI Components - Solar CRM

This directory contains all reusable UI components for the Solar CRM application, with a focus on accessibility, user experience, and consistency.

## Component Categories

### Loading States

#### Spinner
A customizable loading spinner with three sizes (sm, md, lg).

```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner size="md" />
```

#### LoadingButton
A button component that shows a loading spinner when processing.

```tsx
import { LoadingButton } from "@/components/ui/loading-button";

<LoadingButton loading={isLoading}>
  Save Changes
</LoadingButton>
```

#### Skeleton Loaders
Pre-built skeleton loaders for common components:
- `LeadListSkeleton` - For lead lists
- `TimelineSkeleton` - For timeline views
- `DocumentListSkeleton` - For document lists
- `DashboardMetricsSkeleton` - For dashboard metrics
- `FormSkeleton` - For forms
- `TableSkeleton` - For tables

```tsx
import { LeadListSkeleton } from "@/components/ui/skeleton-loaders";

{isLoading ? <LeadListSkeleton /> : <LeadList data={leads} />}
```

#### UploadProgress
A progress bar for file uploads.

```tsx
import { UploadProgress } from "@/components/ui/upload-progress";

<UploadProgress progress={uploadProgress} fileName="document.pdf" />
```

### Notifications

#### Toast Notifications
Using Sonner for toast notifications with a convenient API.

```tsx
import { toast } from "@/lib/toast";

// Success notification
toast.success("Lead created successfully");

// Error notification
toast.error("Failed to save changes", "Please try again");

// Loading notification
const toastId = toast.loading("Uploading document...");
// Later dismiss it
toast.dismiss(toastId);

// Promise-based notification
toast.promise(
  saveData(),
  {
    loading: "Saving...",
    success: "Saved successfully!",
    error: "Failed to save",
  }
);
```

### Confirmation Dialogs

#### ConfirmDialog
A generic confirmation dialog component.

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  confirmText="Yes, proceed"
  cancelText="Cancel"
  variant="destructive"
  onConfirm={handleConfirm}
/>
```

#### useConfirm Hook
A hook for easier confirmation dialog usage.

```tsx
import { useConfirm } from "@/hooks/use-confirm";

function MyComponent() {
  const { confirm, ConfirmationDialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Item",
      description: "Are you sure?",
      variant: "destructive",
    });

    if (confirmed) {
      // Proceed with deletion
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmationDialog />
    </>
  );
}
```

#### Specialized Confirmation Dialogs
- `DeleteConfirmDialog` - For delete actions
- `StatusChangeDialog` - For status changes
- `CloseProjectDialog` - For closing projects
- `DocumentCorruptionDialog` - For marking documents as corrupted

```tsx
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

<DeleteConfirmDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleDelete}
  itemName="Lead #123"
  itemType="lead"
/>
```

### Accessibility Components

#### VisuallyHidden
Hides content visually but keeps it accessible to screen readers.

```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden";

<button>
  <TrashIcon />
  <VisuallyHidden>Delete item</VisuallyHidden>
</button>
```

#### SkipToContent
A skip link for keyboard users to bypass navigation.

```tsx
import { SkipToContent } from "@/components/ui/skip-to-content";

// In layout
<SkipToContent targetId="main-content" />
```

#### AccessibleFormField
A form field wrapper with proper ARIA labels and error handling.

```tsx
import { AccessibleFormField } from "@/components/ui/accessible-form-field";

<AccessibleFormField
  label="Email Address"
  error={errors.email}
  hint="We'll never share your email"
  required
>
  <input type="email" />
</AccessibleFormField>
```

#### AccessibleBadge
A status badge with proper ARIA labels.

```tsx
import { AccessibleBadge } from "@/components/ui/accessible-badge";

<AccessibleBadge status="completed" variant="success">
  Completed
</AccessibleBadge>
```

### Accessibility Hooks

#### useKeyboardShortcut
Add keyboard shortcuts to your components.

```tsx
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

useKeyboardShortcut(
  { key: "s", ctrl: true },
  () => handleSave()
);
```

#### useFocusTrap
Trap focus within a container (useful for modals).

```tsx
import { useFocusTrap } from "@/hooks/use-focus-trap";

function Modal({ open }) {
  const containerRef = useFocusTrap<HTMLDivElement>(open);
  
  return (
    <div ref={containerRef}>
      {/* Modal content */}
    </div>
  );
}
```

## Accessibility Utilities

See `src/lib/accessibility.ts` for utility functions:
- `generateAriaId()` - Generate unique IDs for ARIA attributes
- `announceToScreenReader()` - Announce messages to screen readers
- `isFocusable()` - Check if an element is focusable
- `trapFocus()` - Trap focus within a container
- `getStatusLabel()` - Get accessible label for a status
- `formatDateForScreenReader()` - Format dates for screen readers
- `getKeyboardShortcut()` - Get keyboard shortcut description

## Best Practices

1. **Always provide loading states** - Use skeleton loaders or spinners
2. **Show feedback** - Use toast notifications for user actions
3. **Confirm destructive actions** - Use confirmation dialogs
4. **Make it accessible** - Use ARIA labels, keyboard navigation, and screen reader support
5. **Test with keyboard** - Ensure all functionality is keyboard accessible
6. **Test with screen readers** - Verify content is announced correctly
7. **Check color contrast** - Ensure WCAG AA compliance

## Resources

- [Accessibility Guidelines](../lib/ACCESSIBILITY.md)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
