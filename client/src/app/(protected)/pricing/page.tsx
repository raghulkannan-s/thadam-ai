'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { Button } from '@/shared/ui/Button';
import { Sparkles, Zap, Coins, Check } from 'lucide-react';
import apiClient from '@/core/api/client';
import { toast } from 'sonner';
import { PageLoader } from '@/shared/ui/LoadingSpinner';

export default function ProPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (productType: string) => {
    try {
      setLoading(productType);
      const res = await apiClient.post('/api/v1/payments/create-checkout-session', { productType });
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

  const isPremium = user?.plan === 'PREMIUM';

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-3">
          Upgrade & Refuel
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
          Get Premium for unlimited roadmaps, or grab a quick coin pack to generate more content instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: PREMIUM PLAN */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border-2 border-[var(--accent-primary)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--accent-primary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-sm">
              Premium Subscription
            </div>
            
            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20">
                <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Pro Plan</h3>
                <p className="text-[var(--text-secondary)]">The ultimate learning experience.</p>
              </div>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-[var(--text-primary)]">$9.99</span>
              <span className="text-lg text-[var(--text-secondary)] ml-2">/ month</span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8 flex-grow">
              <div className="flex items-start text-[var(--text-primary)]">
                <Check className="w-5 h-5 text-[var(--accent-primary)] mr-3 shrink-0 mt-0.5" />
                <span><strong className="block">100 Daily Coins</strong> Refresh every 24 hours</span>
              </div>
              <div className="flex items-start text-[var(--text-primary)]">
                <Check className="w-5 h-5 text-[var(--accent-primary)] mr-3 shrink-0 mt-0.5" />
                <span><strong className="block">Unlimited Roadmaps</strong> Create without limits</span>
              </div>
              <div className="flex items-start text-[var(--text-primary)]">
                <Check className="w-5 h-5 text-[var(--accent-primary)] mr-3 shrink-0 mt-0.5" />
                <span><strong className="block">Priority Speed</strong> Faster AI generation</span>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 text-lg font-bold bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white border-none shadow-md shadow-[var(--accent-primary)]/20"
              onClick={() => handleCheckout('premium')}
              disabled={loading !== null || isPremium}
            >
              {loading === 'premium' ? <PageLoader size={20} color="white" /> : isPremium ? 'You are Premium!' : 'Subscribe to Premium'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: COIN PACKAGES */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-yellow-500" />
            Coin Packs
          </h3>
          
          {/* 500 COINS (Best Value) */}
          <div className="rounded-2xl border-2 border-yellow-500 bg-[var(--bg-surface)] p-5 shadow-md flex flex-col relative transition-all hover:shadow-lg hover:border-yellow-400 cursor-pointer" onClick={() => { if(loading === null) handleCheckout('coins_500') }}>
            <div className="absolute -top-3 right-4 bg-yellow-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> BEST VALUE
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-[var(--text-primary)] leading-tight">500 Coins</h4>
                  <p className="text-yellow-600 font-semibold text-sm">Most popular</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-[var(--text-primary)]">$19.99</div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm font-bold h-10"
              disabled={loading !== null}
            >
              {loading === 'coins_500' ? <PageLoader size={16} color="white" /> : 'Buy 500 Coins'}
            </Button>
          </div>

          {/* 100 COINS */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm flex flex-col transition-all hover:border-yellow-500/50 hover:shadow-md cursor-pointer" onClick={() => { if(loading === null) handleCheckout('coins_100') }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-[var(--text-primary)] leading-tight">100 Coins</h4>
                  <p className="text-[var(--text-secondary)] text-sm">Quick top-up</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-[var(--text-primary)]">$4.99</div>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full border-[var(--border-subtle)] hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500/30 font-bold h-10"
              disabled={loading !== null}
            >
              {loading === 'coins_100' ? <PageLoader size={16} /> : 'Buy 100 Coins'}
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
