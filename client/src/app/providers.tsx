"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";

// Note: ToastProvider, ThemeProvider can be added back here once they are refactored.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
