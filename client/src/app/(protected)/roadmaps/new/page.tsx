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

const difficulties = [
  { value: 'BEGINNER', label: 'Beginner', description: 'New to the topic' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Deep dive' },
];



export default function NewRoadmapPage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [estimatedHoursPerDay, setEstimatedHoursPerDay] = useState(1.0);
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
      timers.push(setTimeout(() => setGenerationStage(3), 20000));
    } else {
      setGenerationStage(0);
    }
    return () => timers.forEach(clearTimeout);
  }, [isPending]);

  const progressMessages = [
    "Analyzing your request...",
    "Drafting curriculum...",
    "Validating milestones and tasks...",
    "Finalizing the roadmap..."
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
      durationWeeks,
      estimatedHoursPerDay,
      additionalContext
    });
    
    generate(
      { prompt, difficulty, durationWeeks, estimatedHoursPerDay, visibility },
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
    <div className="mx-auto max-w-2xl pb-20 pt-8 relative animate-fade-in-up">
      <Link 
        href="/community" 
        className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8 no-underline"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back
      </Link>

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

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <BarChart3 className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                disabled={isPending}
                className={`rounded-[var(--radius-md)] border p-4 text-left transition-all cursor-pointer ${
                  difficulty === d.value 
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 ring-1 ring-[var(--accent-primary)]/20 shadow-sm' 
                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                <p className="text-sm font-bold text-[var(--text-primary)]">{d.label}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{d.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> Timeline (Weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              disabled={isPending}
              placeholder="e.g. 4"
              className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-sm"
            />
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
              onChange={(e) => setEstimatedHoursPerDay(Number(e.target.value))}
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

        {/* Submit */}
        <div className="pt-6">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            disabled={isPending || !topic.trim()}
            className="h-14 text-base font-semibold transition-all overflow-hidden"
          >
            {isPending ? (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                 <div className="flex items-center">
                   <div className="mr-3">
                     <Spinner size={20} />
                   </div>
                   <span>{progressMessages[generationStage]}</span>
                 </div>
              </div>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Generate Roadmap (10 Coins)
              </>
            )}
          </Button>

          {isPending && (
            <div className="mt-6 flex flex-col items-center space-y-3 animate-fade-in">
               <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div 
                     className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${Math.min(100, (generationStage + 1) * 25)}%` }}
                  />
               </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
