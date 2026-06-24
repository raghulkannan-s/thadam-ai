'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Clock, BarChart3, ArrowLeft, Target, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Spinner } from '@/shared/ui/LoadingSpinner';
import { useGenerateRoadmap } from '@/features/roadmap/api/mutations';
import { toast } from 'sonner';
import { useCoinBalance } from '@/features/ledger/api/queries';
import Link from 'next/link';
import { buildRoadmapPrompt } from '@/features/roadmap/utils/prompts';
import { CoinCatcherGame } from '@/features/roadmap/components/CoinCatcherGame';

const difficulties = [
  { value: 'BEGINNER', label: 'Beginner', description: 'New to the topic' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Deep dive' },
];



const categories = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'COOKING', label: 'Cooking' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewRoadmapPage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [category, setCategory] = useState('TECHNOLOGY');
  const [durationValue, setDurationValue] = useState("4");
  const [durationType, setDurationType] = useState("WEEKS");
  const [estimatedHoursPerDay, setEstimatedHoursPerDay] = useState("1");
  const [additionalContext, setAdditionalContext] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  
  const { mutate: generate, isPending } = useGenerateRoadmap();
  
  const { data: coinData } = useCoinBalance();

  const [generationStage, setGenerationStage] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    if (isPending) {
      setGenerationStage(0);
      timers.push(setTimeout(() => setGenerationStage(1), 5000));
      timers.push(setTimeout(() => setGenerationStage(2), 12000));
      timers.push(setTimeout(() => setGenerationStage(3), 22000));
      timers.push(setTimeout(() => setGenerationStage(4), 35000));
      timers.push(setTimeout(() => setGenerationStage(5), 50000));
      timers.push(setTimeout(() => setGenerationStage(6), 70000));
    } else {
      setGenerationStage(0);
    }
    return () => timers.forEach(clearTimeout);
  }, [isPending]);

  const progressMessages = [
    "Analyzing your request...",
    "Researching the best learning path...",
    "Drafting curriculum structure...",
    "Building milestones and tasks...",
    "Validating content quality...",
    "Polishing the final roadmap...",
    "Almost there, hang tight!"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (coinData && coinData.balance < 10) {
      toast.error("Insufficient coins. Generating a roadmap requires 10 coins.");
      return;
    }
    
    const prompt = buildRoadmapPrompt({
      topic,
      difficulty,
      durationValue: parseInt(durationValue) || 4,
      durationType,
      estimatedHoursPerDay: parseFloat(estimatedHoursPerDay) || 1.0,
      additionalContext
    });
    
    toast.success("AI is thinking! Play the coin catcher game while you wait! 🎮");
    
    generate(
      { 
        prompt, 
        difficulty, 
        durationValue: parseInt(durationValue) || 4,
        durationType, 
        estimatedHoursPerDay: parseFloat(estimatedHoursPerDay) || 1.0, 
        visibility, 
        category,
        isRegeneration: false 
      },
      {
        onSuccess: (roadmap) => {
          const id = roadmap.id;
          if (id) {
            router.push(`/roadmaps/${id}/preview`);
          } else {
            console.error("Roadmap generation succeeded but ID was missing:", roadmap);
            router.push(`/community`);
          }
        },
        onError: (error) => {
          console.error("Generation failed:", error);
        }
      }
    );
  };

  return (
    <div className="relative animate-fade-in-up min-h-screen">
      <div className="absolute top-0 left-4 lg:left-8 z-10">
        <Link 
          href="/community" 
          className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] shadow-sm"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-2xl pb-20 pt-16 relative">
        <div className="mb-10 text-center">
          <Badge variant="default" className="mb-4 inline-flex shadow-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI-Powered
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">What do you want to learn?</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto leading-relaxed">
            Describe your goal. We'll generate a personalized, structured curriculum to get you there.
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-10 relative bg-[var(--bg-base)] premium-card p-8">
        
        {/* Goal */}
        <div>
          <label htmlFor="topic" className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <Target className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Primary Goal
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Master System Design, Learn Rust, Build a SaaS..."
            className="w-full h-14 px-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all shadow-sm"
            required
            disabled={isPending}
            autoFocus
          />
        </div>

        {/* Difficulty & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <Target className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Starting Level
            </label>
            <div className="grid grid-cols-1 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => setDifficulty(diff.value)}
                  className={`flex flex-col items-start p-4 rounded-[var(--radius-md)] border text-left transition-all ${
                    difficulty === diff.value
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <span className={`font-bold text-sm ${difficulty === diff.value ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                    {diff.label}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] mt-1">{diff.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center justify-center p-3 rounded-[var(--radius-md)] border text-center transition-all ${
                    category === cat.value
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <span className={`font-bold text-sm ${category === cat.value ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Timeline
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                disabled={isPending}
                placeholder="e.g. 4"
                className="w-1/2 h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-sm"
              />
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value)}
                disabled={isPending}
                className="w-1/2 h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="HOURS">Hours</option>
                <option value="DAYS">Days</option>
                <option value="WEEKS">Weeks</option>
                <option value="MONTHS">Months</option>
                <option value="YEARS">Years</option>
              </select>
            </div>
          </div>

          {/* Time Commitment */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Daily Commitment (Hours)
            </label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={estimatedHoursPerDay}
              onChange={(e) => setEstimatedHoursPerDay(e.target.value)}
              disabled={isPending}
              placeholder="e.g. 1.5"
              className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Additional Context */}
        <div>
          <label htmlFor="context" className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <Sparkles className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Additional Context & Preferences (Optional)
          </label>
          <textarea
            id="context"
            rows={4}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="e.g. 'I already know HTML and CSS, focus on React specifically. Make it highly project-based.' Provide any precise instructions for the AI."
            className="w-full p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all shadow-sm resize-none"
            disabled={isPending}
          />
        </div>

        {/* Visibility */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
           <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Visibility</label>
           <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                disabled={isPending}
                className={`flex-1 rounded-[var(--radius-md)] border p-3 flex items-center justify-center transition-all ${visibility === 'PUBLIC' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <Eye className="w-4 h-4 mr-2" /> Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                disabled={isPending}
                className={`flex-1 rounded-[var(--radius-md)] border p-3 flex items-center justify-center transition-all ${visibility === 'PRIVATE' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <EyeOff className="w-4 h-4 mr-2" /> Private
              </button>
           </div>
        </div>

        {/* Submit or Game */}
        <div className="pt-6">
          {!isPending ? (
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth 
              disabled={!topic.trim()}
              className="h-14 text-base font-semibold transition-all overflow-hidden shadow-md hover:shadow-lg"
            >
              Generate Roadmap <img src="/assets/coin.png" alt="Coins" className="w-8 h-8 object-contain ml-3 -mr-1 drop-shadow-md scale-110" />10
            </Button>
          ) : (
            <div className="animate-fade-in">
              <CoinCatcherGame />
              <div className="mt-6 w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, ((generationStage + 1) / 7) * 100)}%` }}
                />
              </div>
              <p className="text-center text-xs text-[var(--text-tertiary)] mt-3 font-semibold tracking-wide uppercase">
                {progressMessages[generationStage]}
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}
