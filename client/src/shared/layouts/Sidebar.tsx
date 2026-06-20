'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, BookOpen, Users, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/Button';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

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
      "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-6 transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isDesktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
    )}>
      <div className="mb-10 flex items-center justify-between px-2">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white font-bold shadow-lg shadow-[var(--accent-primary)]/30">
            T
          </div>
          <span className="ml-3 text-lg font-bold tracking-tight text-[var(--text-primary)]">
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
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
              onClick={() => setIsOpen?.(false)}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="my-6 border-t border-[var(--border-subtle)]" />

        <Button 
          variant="primary" 
          fullWidth 
          className="justify-start shadow-md gap-2 h-12"
          onClick={() => {
            setIsOpen?.(false);
            router.push('/roadmaps/new');
          }}
        >
          <Plus className="h-5 w-5" />
          Create Roadmap
        </Button>
      </nav>

      <div className="mt-auto px-2 pb-4 flex flex-col gap-4">
          <div className="rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent p-4 border border-[var(--accent-primary)]/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">
              Pro Tip
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Fork a roadmap from the Explore page to customize it.
            </p>
          </div>
          <ThemeToggle />
        </div>
    </aside>
  );
}
