"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full" />; // Skeleton to prevent layout shift
  }

  return (
    <div className="flex items-center justify-between p-1 border border-[var(--border-subtle)] rounded-md bg-[var(--bg-elevated)] w-full">
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 h-8 px-2 rounded ${theme === "light" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 h-8 px-2 rounded ${theme === "system" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        onClick={() => setTheme("system")}
        aria-label="System mode"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 h-8 px-2 rounded ${theme === "dark" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
}
