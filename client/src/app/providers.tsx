"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/shared/ui/Toast";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
