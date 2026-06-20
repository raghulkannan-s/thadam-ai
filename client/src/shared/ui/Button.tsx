import * as React from "react"
import { cn } from "@/utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg" | "icon"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    
    // Core Focus-Visible Ring applied globally for WCAG Accessibility
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      primary: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] shadow-sm border border-transparent",
      secondary: "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-sm",
      outline: "border border-[var(--border-default)] bg-transparent hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] text-[var(--text-primary)]",
      ghost: "hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      danger: "bg-[var(--error)] text-white hover:bg-red-700 shadow-sm border border-transparent",
    }
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10"
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
