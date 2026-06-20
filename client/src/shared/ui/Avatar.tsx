import * as React from "react"
import { cn } from "@/utils/cn"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  fallback: string
  size?: "sm" | "md" | "lg" | "xl"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, size = "md", ...props }, ref) => {
    
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-14 w-14 text-base",
      xl: "h-20 w-20 text-lg"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border-2 border-[var(--bg-surface)] bg-[var(--accent-primary)]/10",
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Avatar"
              className="aspect-square h-full w-full object-cover"
            />
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center font-bold text-[var(--accent-primary)] uppercase">
            {fallback.slice(0, 2)}
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
