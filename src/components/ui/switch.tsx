"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { penpotColors } from "@/lib/design-system/tokens"

/**
 * Switch (Toggle) Component - Penpot Design System
 * 
 * Atomic component implementing toggle switch from the Penpot design system.
 * Supports checked, unchecked, and disabled states.
 * 
 * @example
 * ```tsx
 * <Switch checked={true} onCheckedChange={handleChange} />
 * <Switch disabled />
 * ```
 */

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  /**
   * The visual state of the switch
   */
  state?: 'default' | 'error' | 'success'
}

function Switch({
  className,
  state = 'default',
  ...props
}: SwitchProps) {
  const stateClasses = {
    default: "data-[state=checked]:bg-[var(--penpot-primary)] data-[state=unchecked]:bg-[var(--penpot-bg-gray-200)] focus-visible:ring-[var(--penpot-primary)]/20",
    error: "data-[state=checked]:bg-[var(--penpot-error)] data-[state=unchecked]:bg-[var(--penpot-bg-gray-200)] focus-visible:ring-[var(--penpot-error)]/20",
    success: "data-[state=checked]:bg-[var(--penpot-success)] data-[state=unchecked]:bg-[var(--penpot-bg-gray-200)] focus-visible:ring-[var(--penpot-success)]/20",
  }
  
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        stateClasses[state],
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white ring-0 transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
