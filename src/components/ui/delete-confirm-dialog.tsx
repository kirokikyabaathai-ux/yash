"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  itemType?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "item",
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}`}
      description={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
