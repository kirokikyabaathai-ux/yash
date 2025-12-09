import * as React from "react"
import { cn } from "@/lib/utils"
import { penpotColors, penpotRadii, penpotSpacing } from "@/lib/design-system/tokens"

/**
 * Input Component - Penpot Design System
 * 
 * Atomic component implementing input field variants from the Penpot design system.
 * Supports text, email, password, number, and tel types with icon support and state variants.
 * 
 * @example
 * ```tsx
 * <Input type="text" placeholder="Enter text" />
 * <Input type="email" leftIcon={<MailIcon />} state="error" />
 * <Input type="password" rightIcon={<EyeIcon />} />
 * ```
 */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * The visual state of the input
   */
  state?: 'default' | 'error' | 'success' | 'disabled'
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode
  /**
   * Size variant of the input
   */
  size?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = 'default', leftIcon, rightIcon, size = 'md', disabled, ...props }, ref) => {
    const isDisabled = disabled || state === 'disabled'
    
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    }
    
    const stateClasses = {
      default: "border-[var(--penpot-border-light)] focus-visible:border-[var(--penpot-primary)] focus-visible:ring-[var(--penpot-primary)]/20",
      error: "border-[var(--penpot-error)] focus-visible:border-[var(--penpot-error)] focus-visible:ring-[var(--penpot-error)]/20",
      success: "border-[var(--penpot-success)] focus-visible:border-[var(--penpot-success)] focus-visible:ring-[var(--penpot-success)]/20",
      disabled: "border-[var(--penpot-border-light)] bg-[var(--penpot-bg-gray-50)] cursor-not-allowed opacity-50",
    }
    
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--penpot-neutral-secondary)] [&_svg]:size-4">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex w-full rounded-[8px] border bg-white px-3 py-2 transition-all",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-[var(--penpot-neutral-secondary)]",
              "focus-visible:outline-none focus-visible:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              stateClasses[state],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            disabled={isDisabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--penpot-neutral-secondary)] [&_svg]:size-4">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[8px] border bg-white px-3 py-2 transition-all",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[var(--penpot-neutral-secondary)]",
          "focus-visible:outline-none focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          stateClasses[state],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
