'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { Button } from '@/shared/ui/Button';
import { Sparkles, Zap, Coins, Check, Loader2, Minus, ArrowRight, Crown } from 'lucide-react';
import apiClient from '@/core/api/client';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

import { Suspense } from 'react';

function ProPageContent() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Payment successful! Your account has been updated.", { id: 'payment-success' });
      refresh(); // Pull the new coins/plan from the backend instantly
      router.replace('/pricing'); // Clear the query params
    } else if (searchParams.get('canceled') === 'true') {
      toast.error("Payment was canceled.", { id: 'payment-canceled' });
      router.replace('/pricing');
    }
  }, [searchParams, refresh, router]);

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

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your Premium subscription?")) {
      return;
    }
    
    try {
      setLoading('cancel');
      await apiClient.post('/api/v1/payments/cancel-subscription');
      toast.success("Subscription cancelled successfully. Your plan will remain active until the end of the billing cycle.");
      await refresh(); // Silently update UI instead of hard reload
    } catch (err) {
      toast.error("Failed to cancel subscription");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const isPremium = user?.plan === 'PREMIUM';

  return (
    <div className="max-w-6xl mx-auto pt-10 pb-16 px-4 h-full flex flex-col">
      
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3 animate-fade-in-up">
          Supercharge Your Learning
        </h1>
        <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-lg mx-auto animate-fade-in-up delay-100">
          Unlock the full potential of AI-driven roadmaps or grab a quick top-up.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        
        {/* FREE PLAN */}
        <div className="flex flex-col rounded-3xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Basic</h3>
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] block uppercase tracking-wide">Free forever</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-8 flex-grow text-sm">
            <div className="flex items-center text-[var(--text-secondary)]">
              <Check className="w-5 h-5 text-[var(--text-tertiary)] mr-3 shrink-0" />
              <span><strong className="text-[var(--text-primary)] text-sm">10 Coins</strong> daily</span>
            </div>
            <div className="flex items-center text-[var(--text-secondary)]">
              <Check className="w-5 h-5 text-[var(--text-tertiary)] mr-3 shrink-0" />
              <span><strong className="text-[var(--text-primary)] text-sm">1 Roadmap</strong> per day</span>
            </div>
            <div className="flex items-center text-[var(--text-secondary)]">
              <Check className="w-5 h-5 text-[var(--text-tertiary)] mr-3 shrink-0" />
              <span>Standard speed</span>
            </div>
            <div className="flex items-center text-[var(--text-tertiary)] opacity-60">
              <Minus className="w-5 h-5 mr-3 shrink-0" />
              <span>Advanced AI models</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-black text-[var(--text-primary)]">$0</span>
            </div>
            <Button 
              variant="outline"
              className="w-full h-12 text-sm font-bold border-2 border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl pointer-events-none"
            >
              {isPremium ? 'Free Tier' : 'Current Plan'}
            </Button>
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="relative group flex flex-col rounded-3xl border border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-[var(--bg-surface)] p-6 shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-blue-900/10 dark:hover:shadow-blue-900/30 animate-fade-in-up delay-300 z-10 lg:-mt-2 lg:mb-2 ring-1 ring-inset ring-white/60 dark:ring-white/5">
          <div className="absolute top-0 inset-x-0 flex justify-center -mt-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 shadow-md px-4 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          
          <div className="flex items-center gap-4 mb-6 mt-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-200 to-yellow-400 flex items-center justify-center border border-yellow-300 shadow-sm shadow-yellow-500/20 shrink-0">
              <Crown className="w-6 h-6 text-yellow-800 fill-current opacity-90" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Pro</h3>
              <span className="text-[10px] font-bold text-blue-600 block uppercase tracking-wide">Unlimited Potential</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-8 flex-grow text-sm">
            <div className="flex items-center text-[var(--text-primary)]">
              <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
              <span><strong className="text-base text-[var(--text-primary)]">100 Coins</strong> daily</span>
            </div>
            <div className="flex items-center text-[var(--text-primary)]">
              <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
              <span><strong className="text-base text-[var(--text-primary)]">Unlimited</strong> roadmaps</span>
            </div>
            <div className="flex items-center text-[var(--text-primary)]">
              <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
              <span><strong className="text-base text-[var(--text-primary)]">Priority</strong> speed</span>
            </div>
            <div className="flex items-center text-[var(--text-primary)]">
              <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
              <span>Advanced AI models</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-black text-[var(--text-primary)]">$4.99</span>
              <span className="text-sm font-semibold text-[var(--text-secondary)] ml-2">/ mo</span>
            </div>
            
            <Button 
              className={`cursor-pointer w-full h-12 text-sm font-bold ${isPremium ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-2 border-red-500/20' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'} rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
              onClick={() => isPremium ? handleCancelSubscription() : handleCheckout('premium')}
              disabled={loading !== null}
            >
              {loading === 'premium' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : loading === 'cancel' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
              ) : isPremium ? (
                'Cancel Subscription'
              ) : (
                <>'Upgrade to Pro' <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* COIN PACKS STACK */}
        <div className="flex flex-col gap-4 h-full animate-fade-in-up delay-400">
          
          {/* 100 COINS */}
          <div 
            onClick={() => { if(loading === null) handleCheckout('coins_100') }}
            className="group flex flex-col justify-between rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-[var(--accent-secondary)]/50 hover:shadow-md cursor-pointer flex-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0 group-hover:scale-110 transition-transform">
                  <img src="/assets/coin.png" alt="Coins" className="absolute inset-0 w-full h-full object-contain drop-shadow-md transition-opacity duration-300 group-hover:opacity-0" />
                  <img src="/assets/clean_coin.gif" alt="Coins" className="absolute inset-0 w-full h-full object-contain drop-shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[var(--text-primary)]">100 Coins</h4>
                  <p className="text-[var(--text-tertiary)] text-[10px] font-medium uppercase tracking-wide">Quick refill</p>
                </div>
              </div>
              <div className="font-black text-xl text-[var(--text-primary)]">$2.49</div>
            </div>
            
            <div className="flex-grow flex items-center mb-4 mt-2">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Perfect for a quick learning sprint.
              </p>
            </div>
            
            <Button 
              variant="outline"
              className="cursor-pointer w-full h-10 border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-bold rounded-xl mt-4"
              disabled={loading !== null}
              onClick={(e) => { e.stopPropagation(); if(loading === null) handleCheckout('coins_100'); }}
            >
              {loading === 'coins_100' ? <><Loader2 className="w-4 h-4 animate-spin" /></> : 'Buy Once'}
            </Button>
          </div>

          {/* 500 COINS */}
          <div 
            onClick={() => { if(loading === null) handleCheckout('coins_500') }}
            className="group relative flex flex-col justify-between rounded-3xl border-2 border-yellow-500/80 bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-yellow-500 hover:shadow-lg cursor-pointer flex-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-current" /> Best Deal
            </div>
            
            <div className="flex items-center justify-between mb-2 mt-1">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0 group-hover:scale-110 transition-transform">
                  <img src="/assets/coin.png" alt="Coins" className="absolute inset-0 w-full h-full object-contain drop-shadow-md transition-opacity duration-300 group-hover:opacity-0" />
                  <img src="/assets/clean_coin.gif" alt="Coins" className="absolute inset-0 w-full h-full object-contain drop-shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[var(--text-primary)]">500 Coins</h4>
                  <p className="text-yellow-600 text-[10px] font-medium uppercase tracking-wide">Bulk top-up</p>
                </div>
              </div>
              <div className="font-black text-xl text-[var(--text-primary)] mr-1">$7.99</div>
            </div>
            
            <div className="flex-grow flex items-center mb-4 mt-2">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Stock up for uninterrupted learning.
              </p>
            </div>
            
            <Button 
              className="cursor-pointer w-full h-10 bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm rounded-xl font-bold text-xs mt-4"
              disabled={loading !== null}
              onClick={(e) => { e.stopPropagation(); if(loading === null) handleCheckout('coins_500'); }}
            >
              {loading === 'coins_500' ? <><Loader2 className="w-4 h-4 animate-spin" /></> : 'Buy Once'}
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProPage() {
  return (
    <Suspense fallback={null}>
      <ProPageContent />
    </Suspense>
  );
}
