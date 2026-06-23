"use client";

import { SlidingAuth } from "@/features/auth/components/SlidingAuth";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/shared/ui/LoadingSpinner";

export default function LoginPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.push("/home");
    }
  }, [user, status, router]);

  if (status === "checking" || status === "authenticated") {
    return <PageLoader />;
  }

  return <SlidingAuth defaultMode="login" />;
}
