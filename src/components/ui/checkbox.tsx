"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { penpotColors, penpotRadii } from "@/lib/design-system/tokens"

/**
 * Checkbox Component - Penpot Design System
 * 
 * Atomic component implementing checkbox from the Penpot design system.
 * Supports checked, unchecked, and disabled states.
 * 
 * @example
 * ```tsx
 * <Checkbox checked={true} onCheckedChange={handleChange} />
 * <Checkbox disabled />
 * ```
 */

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /**
   * The visual state of the checkbox
   */
  state?: 'default' | 'error' | 'success'
}

function Checkbox({
  className,
  state = 'default',
  ...props
}: CheckboxProps) {
  const stateClasses = {
    default: "border-[var(--penpot-border-light)] data-[state=checked]:bg-[var(--penpot-primary)] data-[state=checked]:border-[var(--penpot-primary)] focus-visible:ring-[var(--penpot-primary)]/20",
    error: "border-[var(--penpot-error)] data-[state=checked]:bg-[var(--penpot-error)] data-[state=checked]:border-[var(--penpot-error)] focus-visible:ring-[var(--penpot-error)]/20",
    success: "border-[var(--penpot-success)] data-[state=checked]:bg-[var(--penpot-success)] data-[state=checked]:border-[var(--penpot-success)] focus-visible:ring-[var(--penpot-success)]/20",
  }
  
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border bg-white transition-all outline-none",
        "data-[state=checked]:text-white",
        "focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        stateClasses[state],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
