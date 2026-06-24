'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, User, Shield, Menu, Coins, Sparkles, Plus } from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { useAuth } from '@/features/auth/context/auth-context';
import { useCoinBalance } from '@/features/ledger/api/queries';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  const [ringing, setRinging] = useState(false);
  const [bellClicks, setBellClicks] = useState(0);
  
  const { data: coinData } = useCoinBalance();
  const queryClient = useQueryClient();

  const handleBellClick = () => {
    setRinging(true);
    setBellClicks(prev => prev + 1);
    
    if (bellClicks === 0) {
      toast.success("🔔 Ding dong! You found the secret bell!");
    } else if (bellClicks === 2) {
      toast.info("Stop ringing it, there are no notifications yet! 😂");
    } else if (bellClicks === 5) {
      toast.success("Okay, okay, you're persistent! 🪙");
    }
    
    setTimeout(() => setRinging(false), 800);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-8 backdrop-blur-md">
      
      {/* Search Bar & Mobile Menu */}
      <div className="flex w-full max-w-md items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden mr-3 p-1.5 -ml-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            placeholder="Search roadmaps, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                router.push(`/community?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        
        {/* Coin Balance */}
        <div className="flex items-center space-x-2">
          <button 
            className="cursor-pointer flex items-center bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-900/40 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-500 hover:border-amber-400 hover:shadow-lg hover:-translate-y-px pl-1 pr-2 py-1 rounded-full font-bold text-sm tracking-tight transition-all shadow-md shadow-amber-500/20" 
            title="Buy Coins"
            onClick={() => router.push('/pricing')}
          >
            <img src="/assets/clean_coin.gif" alt="Coins" className="w-7 h-7 object-contain shrink-0 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] animate-revolve mr-1" />
            <span className="text-amber-950 dark:text-amber-100 drop-shadow-sm">{coinData?.balance ?? 0}</span>
            <div className="ml-1.5 flex items-center justify-center bg-amber-500/20 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 rounded-full w-4 h-4 shrink-0">
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </div>
          </button>
          {user?.plan !== 'PREMIUM' && (
            <button 
              onClick={() => router.push('/pricing')}
              className="cursor-pointer hidden sm:flex items-center bg-gradient-to-r from-amber-200 to-yellow-400 border border-yellow-300 shadow-sm shadow-yellow-500/20 text-yellow-900 transition-all hover:-translate-y-0.5 active:translate-y-0 px-4 py-1.5 rounded-full font-bold text-sm tracking-tight"
            >
              <Sparkles className="h-4 w-4 mr-1.5 fill-current opacity-80" />
              Upgrade
            </button>
          )}
        </div>

        {/* Notifications (placeholder) */}
        <ThemeToggle />
        <button 
          onClick={handleBellClick}
          className={`relative rounded-full w-10 h-10 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-primary)] transition-colors ${ringing ? 'animate-shake scale-110 text-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/50 border-yellow-500/50' : ''}`}
          aria-label="Notifications"
          title="Notifications coming soon"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 border-l border-[var(--border-subtle)] pl-4 cursor-pointer group"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div className="flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                {user?.name || 'Explorer'}
              </span>
              <span className="text-xs font-medium text-[var(--text-tertiary)]">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Learner'}
              </span>
            </div>
            <Avatar 
              src={user?.avatarUrl}
              fallback={user?.name || 'U'} 
              size="sm" 
              className="ring-2 ring-transparent group-hover:ring-[var(--accent-primary)] transition-all"
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl py-1.5 animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">{user?.email}</p>
              </div>
              
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              <div className="border-t border-[var(--border-subtle)] mt-1.5 pt-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--error)] hover:bg-red-500/10 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
