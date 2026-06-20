import { cn } from "@/utils/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--border-subtle)]", className)}
      {...props}
    />
  );
}

export function RoadmapCardSkeleton() {
  return (
    <div className="flex flex-col h-[280px] p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-10" />
      </div>
      <Skeleton className="h-8 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      <div className="mt-auto space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex items-center space-x-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
