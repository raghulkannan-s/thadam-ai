import * as React from "react"
import { cn } from "@/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  
  const variants = {
    default: "bg-[var(--accent-primary)] text-white",
    secondary: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    outline: "text-[var(--text-primary)] border border-[var(--border-default)]",
    success: "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20",
    error: "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
