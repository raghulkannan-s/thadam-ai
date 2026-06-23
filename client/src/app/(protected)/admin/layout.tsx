"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import { PageLoader } from "@/shared/ui/LoadingSpinner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, Map } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) return <PageLoader />;

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="premium-card p-10 max-w-md text-center animate-scale-in">
          <Shield className="h-12 w-12 text-[var(--error)] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Access Denied</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            You need administrator or moderator privileges to access this workspace.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: "Users", href: "/admin", roles: ["ADMIN"], icon: Users },
    { label: "Roadmaps", href: "/admin/roadmaps", roles: ["ADMIN", "MODERATOR"], icon: Map },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[var(--bg-base)] -m-4 sm:-m-6 lg:-m-8">
      {/* Sub-Sidebar for Admin Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shrink-0">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[0.65rem] font-bold tracking-wider uppercase mb-3">
            <Shield className="h-3 w-3" />
            {user.role} Workspace
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Admin Dashboard</h2>
        </div>
        
        <nav className="flex flex-col gap-1.5">
          {tabs.map((tab) => {
            if (!tab.roles.includes(user.role)) return null;
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link key={tab.href} href={tab.href} className="no-underline">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                  isActive 
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold shadow-sm shadow-[var(--accent-primary)]/5"
                    : "text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                )}>
                  <Icon className={cn("h-4 w-4", isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} />
                  {tab.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
