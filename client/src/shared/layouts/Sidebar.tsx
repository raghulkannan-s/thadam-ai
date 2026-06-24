'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, BookOpen, Users, Plus, X, Menu, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/features/auth/context/auth-context';

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Explore', href: '/community', icon: Compass },
  { name: 'My Learning', href: '/my-learning', icon: BookOpen },
  { name: 'People', href: '/people', icon: Users },
];

export function Sidebar({ isOpen = false, isDesktopOpen = true, setIsOpen, setIsDesktopOpen }: { isOpen?: boolean; isDesktopOpen?: boolean; setIsOpen?: (v: boolean) => void; setIsDesktopOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 transition-all duration-300",
      isOpen ? "translate-x-0 w-64 px-4" : "-translate-x-full w-64 px-4",
      "lg:translate-x-0",
      isDesktopOpen ? "lg:w-64 lg:px-4" : "lg:w-20 lg:px-2"
    )}>
      <div className={cn("mb-10 flex items-center px-2", isDesktopOpen ? "justify-between" : "justify-center")}>
        {isDesktopOpen ? (
          <>
            <Link href="/?view=landing" className="flex items-center no-underline hover:opacity-80 transition-opacity">
              <img src="/assets/logo-no-bg.png" alt="Thadam AI Logo" className="h-[52px] w-[52px] shrink-0 object-contain animate-heartbeat" />
              <span className="ml-3 text-2xl font-black tracking-tight text-[var(--text-primary)] transition-opacity">
                Thadam
              </span>
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center">
            {/* Logo when collapsed */}
            <Link href="/?view=landing" className="hover:opacity-80 transition-opacity">
              <img src="/assets/logo-no-bg.png" alt="Thadam AI Logo" className="h-[52px] w-[52px] shrink-0 object-contain animate-heartbeat" />
            </Link>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button 
          className="lg:hidden p-2 -mr-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors"
          onClick={() => setIsOpen?.(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                isDesktopOpen ? 'px-3' : 'lg:justify-center px-3',
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
              onClick={() => setIsOpen?.(false)}
              title={!isDesktopOpen ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isDesktopOpen ? 'mr-3' : 'lg:mr-0 mr-3',
                  isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
                )}
              />
              <span className={cn("transition-opacity truncate", !isDesktopOpen && "lg:hidden")}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="my-6 border-t border-[var(--border-subtle)]" />

        <Button 
          variant="primary" 
          fullWidth={isDesktopOpen}
          className={cn(
            "shadow-md gap-2 h-12 transition-all overflow-hidden",
            isDesktopOpen ? "justify-start px-4" : "lg:justify-center lg:px-0 lg:w-12 lg:mx-auto px-4 justify-start"
          )}
          onClick={() => {
            setIsOpen?.(false);
            router.push('/roadmaps/new');
          }}
          title={!isDesktopOpen ? "Create Roadmap" : undefined}
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap transition-opacity", !isDesktopOpen && "lg:hidden")}>
             Create Roadmap
          </span>
        </Button>
        <div className="mt-auto px-2 pb-4">
          <div className="my-4 border-t border-[var(--border-subtle)]" />
          
          {user?.plan !== 'PREMIUM' && (
            <div className={cn("transition-all duration-300", !isDesktopOpen && "lg:hidden")}>
              <div className="rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-purple-500/10 p-4 border border-[var(--accent-primary)]/20 relative overflow-hidden group hover:border-[var(--accent-primary)]/40 transition-colors shadow-sm">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 rounded-full w-16 h-16 opacity-10 group-hover:scale-150 transition-transform duration-500" />
                <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" /> Upgrade to Pro
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 relative z-10">
                  Get unlimited roadmaps and daily coins.
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full h-8 text-xs font-bold relative z-10 shadow-sm" 
                  onClick={() => {
                    setIsOpen?.(false);
                    router.push('/pricing');
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

        {/* Desktop Toggle Button at bottom */}
        <div className="mt-2 hidden lg:flex border-t border-[var(--border-subtle)] pt-4">
          <button 
            className={cn(
              "flex items-center rounded-xl py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200 w-full",
              isDesktopOpen ? "px-3 justify-start" : "px-3 justify-center"
            )}
            onClick={() => setIsDesktopOpen?.(!isDesktopOpen)}
            aria-label="Toggle desktop menu"
            title="Collapse Sidebar"
          >
            {isDesktopOpen ? (
              <>
                <PanelLeftClose className="h-5 w-5 shrink-0 mr-3 text-[var(--text-tertiary)]" />
                <span className="whitespace-nowrap transition-opacity">Collapse</span>
              </>
            ) : (
              <PanelLeftOpen className="h-5 w-5 shrink-0 text-[var(--text-tertiary)]" />
            )}
          </button>
        </div>
    </aside>
  );
}
