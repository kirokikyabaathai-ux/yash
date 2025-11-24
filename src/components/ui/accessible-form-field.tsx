import * as React from "react";
import { cn } from "@/lib/utils";
import { generateAriaId } from "@/lib/accessibility";

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function AccessibleFormField({
  label,
  error,
  hint,
  required = false,
  children,
  className,
}: AccessibleFormFieldProps) {
  const fieldId = React.useMemo(() => generateAriaId("field"), []);
  const errorId = React.useMemo(() => generateAriaId("error"), []);
  const hintId = React.useMemo(() => generateAriaId("hint"), []);

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? "true" : undefined,
    "aria-required": required ? "true" : undefined,
  } as any);

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {childWithProps}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
