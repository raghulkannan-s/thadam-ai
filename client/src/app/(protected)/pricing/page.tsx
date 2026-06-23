'use client';

import { useAuth } from '@/features/auth/context/auth-context';
import { apiFetch } from '@/lib/api';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { PageLoader } from '@/shared/ui/LoadingSpinner';
import { toast } from 'sonner';
import { Check, Sparkles, Coins, Zap } from 'lucide-react';
import { useState } from 'react';

export default function PricingPage() {
  const { user, isLoading } = useAuth();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleCheckout = async (productType: string) => {
    setLoadingType(productType);
    try {
      const res = await apiFetch<{ url: string }>('/api/v1/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ productType }),
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
      setLoadingType(null);
    }
  };

  if (isLoading) return <PageLoader />;

  const isPremium = user?.plan === 'PREMIUM';

  return (
    <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Supercharge Your Learning
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Upgrade to Premium for unlimited forks and daily coins, or buy coins instantly to keep generating roadmaps.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Free Plan */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-elevated)] opacity-80">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Free Plan</h3>
            <p className="text-[var(--text-secondary)] mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[var(--text-primary)]">$0</span>
              <span className="text-[var(--text-tertiary)]">/forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-[var(--text-secondary)]">
                <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                10 Daily Coins
              </li>
              <li className="flex items-center text-[var(--text-secondary)]">
                <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                Create Custom Roadmaps
              </li>
              <li className="flex items-center text-[var(--text-secondary)]">
                <Check className="h-5 w-5 text-[var(--text-tertiary)] mr-3 shrink-0" />
                Max 3 Active Forks
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              {isPremium ? 'Available' : 'Current Plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-[var(--accent-primary)] bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent relative overflow-hidden shadow-2xl shadow-[var(--accent-primary)]/20">
          <div className="absolute top-0 right-0 bg-[var(--accent-primary)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMMENDED
          </div>
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-[var(--accent-primary)] mb-2 flex items-center">
              <Sparkles className="w-6 h-6 mr-2" />
              Premium
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">For power learners</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[var(--text-primary)]">$9.99</span>
              <span className="text-[var(--text-tertiary)]">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-[var(--text-primary)] font-medium">
                <Check className="h-5 w-5 text-[var(--accent-primary)] mr-3 shrink-0" />
                100 Daily Coins
              </li>
              <li className="flex items-center text-[var(--text-primary)] font-medium">
                <Check className="h-5 w-5 text-[var(--accent-primary)] mr-3 shrink-0" />
                Unlimited Forks
              </li>
              <li className="flex items-center text-[var(--text-primary)] font-medium">
                <Check className="h-5 w-5 text-[var(--accent-primary)] mr-3 shrink-0" />
                Priority AI Generation
              </li>
            </ul>
            <Button 
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white border-0"
              onClick={() => handleCheckout('premium')}
              disabled={loadingType !== null || isPremium}
            >
              {loadingType === 'premium' ? 'Redirecting...' : isPremium ? 'You are Premium!' : 'Upgrade to Premium'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coin Packages */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center justify-center">
          <Coins className="w-6 h-6 mr-2 text-yellow-500" />
          Need more coins now?
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="border-[var(--border-subtle)] hover:border-yellow-500/50 transition-colors cursor-pointer bg-[var(--bg-elevated)]">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1">100 Coins</h4>
                <p className="text-[var(--text-secondary)] text-sm">$4.99 one-time</p>
              </div>
              <Button 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                onClick={() => handleCheckout('coins_100')}
                disabled={loadingType !== null}
              >
                {loadingType === 'coins_100' ? <PageLoader size={16} /> : 'Buy Now'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[var(--border-subtle)] hover:border-yellow-500 transition-colors cursor-pointer bg-gradient-to-r from-yellow-500/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              BEST VALUE
            </div>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1 flex items-center">
                  500 Coins <Zap className="w-4 h-4 ml-1 text-yellow-500" />
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">$19.99 one-time</p>
              </div>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/20"
                onClick={() => handleCheckout('coins_500')}
                disabled={loadingType !== null}
              >
                {loadingType === 'coins_500' ? <PageLoader size={16} /> : 'Buy Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
