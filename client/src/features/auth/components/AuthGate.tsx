"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import type { Role } from "@/lib/types";
import { loginPathForRedirect } from "@/features/auth/context/auth-redirect";
import { PageLoader } from "@/components/ui/LoadingSpinner";

type AuthGateProps = {
  children: ReactNode;
  roles?: Role[];
};

export function AuthGate({ children, roles }: AuthGateProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(loginPathForRedirect(pathname));
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user) {
    return <PageLoader />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div className="panel animate-scale-in" style={{ maxWidth: 420, borderRadius: "var(--radius-2xl)", padding: "40px 32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            Access denied
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
