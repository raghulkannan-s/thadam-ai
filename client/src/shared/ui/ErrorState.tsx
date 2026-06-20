import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an unexpected error while loading this content.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-500 mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
