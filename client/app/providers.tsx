"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { BalanceProvider } from "@/lib/balance-context";
import { ToastProvider } from "@/app/components/Toast";
import { Sidebar } from "@/app/components/Sidebar";
import { PageTransition } from "@/app/components/PageTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BalanceProvider>
      <ToastProvider>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: "var(--sidebar-width, 240px)", transition: "margin-left 0.3s var(--ease-out-expo)" }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </ToastProvider>
      </BalanceProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
