"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DocumentCorruptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  documentName?: string;
}

export function DocumentCorruptionDialog({
  open,
  onOpenChange,
  onConfirm,
  documentName,
}: DocumentCorruptionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Mark Document as Corrupted"
      description={
        documentName
          ? `Are you sure you want to mark "${documentName}" as corrupted? This will notify the uploader and request a re-upload.`
          : "Are you sure you want to mark this document as corrupted? This will notify the uploader and request a re-upload."
      }
      confirmText="Mark as Corrupted"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
