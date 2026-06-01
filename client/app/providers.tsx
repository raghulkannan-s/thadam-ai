"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/app/components/Toast";
import { Navbar } from "@/app/components/Navbar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <div className="bg-radial-glow" />
        <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}
