'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { Button } from '@/shared/ui/Button';
import { Shield, Sparkles, Zap, Coins } from 'lucide-react';
import { api } from '@/shared/api/client';
import { toast } from 'sonner';

export default function ProPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (productType: string) => {
    try {
      setLoading(productType);
      const res = await api.post('/api/v1/payments/create-checkout-session', { productType });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error("Failed to initiate checkout");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl mb-4">
          Upgrade to Premium
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Get the most out of Thadam AI with unlimited learning and generous coin allowances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* FREE PLAN */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Free Tier</h3>
            <p className="text-[var(--text-secondary)] text-sm">Perfect for casual learners.</p>
          </div>
          <div className="mb-8 flex-grow">
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">$0</span>
              <span className="text-[var(--text-secondary)] ml-2">/ month</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Shield className="w-5 h-5 mr-3 text-[var(--text-tertiary)]" />
                Up to 3 active roadmaps
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Coins className="w-5 h-5 mr-3 text-yellow-500" />
                10 Coins daily allowance
              </li>
            </ul>
          </div>
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        {/* PREMIUM PLAN */}
        <div className="rounded-2xl border-2 border-[var(--accent-primary)] bg-[var(--bg-surface)] p-8 shadow-md relative flex flex-col">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-primary)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="w-3 h-3 mr-1" /> Recommended
            </span>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Premium</h3>
            <p className="text-[var(--text-secondary)] text-sm">For dedicated tech explorers.</p>
          </div>
          <div className="mb-8 flex-grow">
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">$10</span>
              <span className="text-[var(--text-secondary)] ml-2">/ month</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Zap className="w-5 h-5 mr-3 text-[var(--accent-primary)]" />
                Unlimited active roadmaps
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Coins className="w-5 h-5 mr-3 text-yellow-500" />
                100 Coins daily allowance
              </li>
            </ul>
          </div>
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => handleCheckout('premium')}
            disabled={loading !== null}
          >
            {loading === 'premium' ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </div>
      </div>

      {/* COIN PACKS */}
      <div className="mt-16 pt-12 border-t border-[var(--border-subtle)] text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Need More Coins?</h2>
        <p className="text-[var(--text-secondary)] mb-8">Purchase one-time coin packs to fuel your learning.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 w-full sm:w-64">
            <Coins className="w-10 h-10 mx-auto text-yellow-500 mb-4" />
            <h4 className="text-lg font-bold mb-1">100 Coins</h4>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mb-6">$5.00</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleCheckout('coins_100')}
              disabled={loading !== null}
            >
              Buy
            </Button>
          </div>
          
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 w-full sm:w-64">
            <Coins className="w-10 h-10 mx-auto text-yellow-500 mb-4" />
            <h4 className="text-lg font-bold mb-1">500 Coins</h4>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mb-6">$20.00</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleCheckout('coins_500')}
              disabled={loading !== null}
            >
              Buy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
