import * as React from "react";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/accessibility";

interface AccessibleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  status?: string;
  children: React.ReactNode;
}

export function AccessibleBadge({
  variant = "default",
  status,
  children,
  className,
  ...props
}: AccessibleBadgeProps) {
  const variantStyles = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-accent text-accent-foreground",
    error: "bg-destructive/10 text-destructive",
    info: "bg-primary/10 text-primary",
  };

  const ariaLabel = status ? getStatusLabel(status) : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </span>
  );
}
