'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, BookOpen, Users, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/Button';

const navItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Explore', href: '/community', icon: Compass },
  { name: 'My Learning', href: '/my-learning', icon: BookOpen },
  { name: 'People', href: '/people', icon: Users },
];

export function Sidebar({ isOpen = false, isDesktopOpen = true, setIsOpen }: { isOpen?: boolean; isDesktopOpen?: boolean; setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 transition-all duration-300",
      isOpen ? "translate-x-0 w-64 px-4" : "-translate-x-full w-64 px-4",
      "lg:translate-x-0",
      isDesktopOpen ? "lg:w-64 lg:px-4" : "lg:w-20 lg:px-2"
    )}>
      <div className={cn("mb-10 flex items-center px-2", isDesktopOpen ? "justify-between" : "justify-center")}>
        <div className="flex items-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white font-bold shadow-lg shadow-[var(--accent-primary)]/30">
            T
          </div>
          <span className={cn("ml-3 text-lg font-bold tracking-tight text-[var(--text-primary)] transition-opacity", !isDesktopOpen && "lg:hidden")}>
            Thadam
          </span>
        </div>
        
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
              <span className={cn("transition-opacity whitespace-nowrap", !isDesktopOpen && "lg:hidden")}>
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
      </nav>

      <div className={cn("mt-auto pb-4 flex flex-col gap-4", isDesktopOpen ? "px-2" : "lg:hidden px-2")}>
          <div className="rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent p-4 border border-[var(--accent-primary)]/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">
              Pro Tip
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Fork a roadmap from the Explore page to customize it.
            </p>
          </div>
        </div>
    </aside>
  );
}
