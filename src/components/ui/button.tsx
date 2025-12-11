import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { penpotColors, penpotRadii, penpotSpacing, penpotShadows } from "@/lib/design-system/tokens"

/**
 * Button Component - Penpot Design System
 * 
 * Atomic component implementing button variants from the Penpot design system.
 * Supports primary, outline, ghost, and link variants with multiple sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" leftIcon={<Icon />}>With Icon</Button>
 * ```
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[var(--penpot-primary)] text-white hover:opacity-90 focus-visible:ring-[var(--penpot-primary)]/50",
        outline: "border-2 border-[var(--penpot-border-light)] bg-transparent text-[var(--penpot-neutral-dark)] hover:bg-[var(--penpot-bg-gray-50)] focus-visible:ring-[var(--penpot-primary)]/50",
        ghost: "bg-transparent text-[var(--penpot-neutral-dark)] hover:bg-[var(--penpot-bg-gray-50)] focus-visible:ring-[var(--penpot-primary)]/50",
        link: "text-[var(--penpot-primary)] underline-offset-4 hover:underline focus-visible:ring-[var(--penpot-primary)]/50",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[4px]",
        md: "h-10 px-4 text-sm rounded-[8px]",
        lg: "h-12 px-6 text-base rounded-[8px]",
      },
      colorScheme: {
        blue: "",
        green: "",
        yellow: "",
        red: "",
        gray: "",
      },
    },
    compoundVariants: [
      // Primary color schemes
      {
        variant: "primary",
        colorScheme: "blue",
        className: "bg-[var(--penpot-primary)]",
      },
      {
        variant: "primary",
        colorScheme: "green",
        className: "bg-[var(--penpot-primary)] text-white",
      },
      {
        variant: "primary",
        colorScheme: "yellow",
        className: "bg-[var(--penpot-warning)] text-[var(--penpot-neutral-dark)]",
      },
      {
        variant: "primary",
        colorScheme: "red",
        className: "bg-[var(--penpot-error)] text-white",
      },
      {
        variant: "primary",
        colorScheme: "gray",
        className: "bg-[var(--penpot-bg-gray-200)] text-[var(--penpot-neutral-dark)]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      colorScheme: "blue",
    },
  }
)

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /**
   * Render as a child component (using Radix Slot)
   */
  asChild?: boolean
  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: React.ReactNode
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  colorScheme,
  asChild = false,
  leftIcon,
  rightIcon,
  fullWidth,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, colorScheme }),
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </Comp>
  )
}

export { Button, buttonVariants }
