import React from "react";
import { FolderX } from "lucide-react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No data found",
  description = "There is nothing here yet.",
  icon = <FolderX className="h-10 w-10 text-[var(--text-tertiary)]" />,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-[var(--bg-surface)]">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-[var(--bg-elevated)] p-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
          {description}
        </p>
        {actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
