"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  currentStatus: string;
  newStatus: string;
  itemType?: string;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  newStatus,
  itemType = "item",
}: StatusChangeDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Status Change"
      description={`Are you sure you want to change the ${itemType} status from "${currentStatus}" to "${newStatus}"?`}
      confirmText="Change Status"
      cancelText="Cancel"
      onConfirm={onConfirm}
    />
  );
}
