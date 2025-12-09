"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { penpotColors, penpotSpacing } from "@/lib/design-system/tokens"

/**
 * Radio Component - Penpot Design System
 * 
 * Atomic component implementing radio buttons from the Penpot design system.
 * Supports checked, unchecked, and disabled states.
 * 
 * @example
 * ```tsx
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1" />
 *   <RadioGroupItem value="option2" />
 * </RadioGroup>
 * ```
 */

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

export interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  /**
   * The visual state of the radio button
   */
  state?: 'default' | 'error' | 'success'
}

function RadioGroupItem({
  className,
  state = 'default',
  ...props
}: RadioGroupItemProps) {
  const stateClasses = {
    default: "border-[var(--penpot-border-light)] data-[state=checked]:border-[var(--penpot-primary)] focus-visible:ring-[var(--penpot-primary)]/20",
    error: "border-[var(--penpot-error)] data-[state=checked]:border-[var(--penpot-error)] focus-visible:ring-[var(--penpot-error)]/20",
    success: "border-[var(--penpot-success)] data-[state=checked]:border-[var(--penpot-success)] focus-visible:ring-[var(--penpot-success)]/20",
  }
  
  const indicatorColorClasses = {
    default: "fill-[var(--penpot-primary)]",
    error: "fill-[var(--penpot-error)]",
    success: "fill-[var(--penpot-success)]",
  }
  
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border bg-white transition-all outline-none",
        "focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        stateClasses[state],
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className={cn("absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2", indicatorColorClasses[state])} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
