"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CloseProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  projectName?: string;
}

export function CloseProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  projectName,
}: CloseProjectDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Close Project"
      description={
        projectName
          ? `Are you sure you want to close the project "${projectName}"? This will mark the project as completed and prevent further modifications unless reopened by an admin.`
          : "Are you sure you want to close this project? This will mark the project as completed and prevent further modifications unless reopened by an admin."
      }
      confirmText="Close Project"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
