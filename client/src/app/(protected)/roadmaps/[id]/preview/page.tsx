'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useRoadmap } from '@/features/roadmap/api/queries';
import { useUpdateRoadmap, useGenerateRoadmap } from '@/features/roadmap/api/mutations';
import { useCoinBalance } from '@/features/ledger/api/queries';
import { buildRoadmapPrompt } from '@/features/roadmap/utils/prompts';
import { toast } from 'sonner';
import { Spinner } from '@/shared/ui/LoadingSpinner';
import { Sparkles, ArrowRight, Target, Clock, BarChart3, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function PreviewRoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const { data: roadmap, isLoading } = useRoadmap(resolvedParams.id);
  const { mutate: updateRoadmap, isPending: isActivating } = useUpdateRoadmap();
  const { mutate: generateRoadmap, isPending: isGenerating } = useGenerateRoadmap();
  const { data: coinData } = useCoinBalance();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
         <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-[var(--bg-elevated)] rounded-md mb-4"></div>
            <div className="h-4 w-48 bg-[var(--bg-surface)] rounded-md"></div>
         </div>
      </div>
    );
  }

  if (!roadmap) {
    return <div>Roadmap not found.</div>;
  }

  const handleStartLearning = () => {
    updateRoadmap(
      { 
        id: resolvedParams.id, 
        data: { 
          title: roadmap.title,
          description: roadmap.description || '',
          status: 'ACTIVE' 
        } 
      },
      {
        onSuccess: () => {
          router.push(`/roadmaps/${resolvedParams.id}`);
        }
      }
    );
  };

  const handleRegenerate = () => {
    if (!additionalContext.trim()) {
      toast.error("Please provide instructions for the AI.");
      return;
    }
    if (coinData && coinData.balance < 5) {
      toast.error("Insufficient coins. Regeneration requires 5 coins.");
      return;
    }
    
    const prompt = buildRoadmapPrompt({
      topic: roadmap.title,
      difficulty: roadmap.difficulty,
      durationWeeks: roadmap.durationWeeks,
      estimatedHoursPerDay: roadmap.estimatedHoursPerDay,
      additionalContext
    });
    
    generateRoadmap({
      prompt,
      difficulty: roadmap.difficulty,
      durationWeeks: roadmap.durationWeeks,
      estimatedHoursPerDay: roadmap.estimatedHoursPerDay,
      visibility: roadmap.visibility || 'PUBLIC',
      isRegeneration: true
    }, {
      onSuccess: (newRoadmap) => {
        setIsRegenerating(false);
        setAdditionalContext('');
        router.push(`/roadmaps/${newRoadmap.id}/preview`);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl pb-20 pt-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <Badge variant="success" className="mb-4 inline-flex shadow-sm">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generation Complete
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Your Roadmap is Ready</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto leading-relaxed">
          Review the curriculum below. You can start learning immediately, or regenerate if you want a different approach.
        </p>
      </div>

      <div className="bg-[var(--bg-base)] premium-card overflow-hidden mb-8">
        <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
           <h2 className="text-2xl font-bold mb-2">{roadmap.title}</h2>
           {roadmap.description && (
             <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
               {roadmap.description}
             </p>
           )}

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 shadow-sm">
                 <div className="flex items-center text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5 mr-1.5" /> Scope
                 </div>
                 <p className="font-bold text-sm">
                    {roadmap.milestoneCount} Milestones<br/>
                    {roadmap.taskCount} Tasks
                 </p>
              </div>
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 shadow-sm">
                 <div className="flex items-center text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-2">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Level
                 </div>
                 <p className="font-bold text-sm capitalize">
                    {roadmap.difficulty?.toLowerCase() || 'Intermediate'}
                 </p>
              </div>
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 shadow-sm">
                 <div className="flex items-center text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Timeline
                 </div>
                 <p className="font-bold text-sm">
                    {roadmap.durationWeeks ? `${roadmap.durationWeeks} Weeks` : '4 Weeks'}
                 </p>
              </div>
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 shadow-sm">
                 <div className="flex items-center text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Daily Pace
                 </div>
                 <p className="font-bold text-sm">
                    {roadmap.estimatedHoursPerDay ? `${roadmap.estimatedHoursPerDay} hrs/day` : '1.0 hrs/day'}
                 </p>
              </div>
           </div>
        </div>

        {!isRegenerating ? (
          <div className="p-8 bg-[var(--bg-base)] flex flex-col sm:flex-row gap-4 items-center justify-end">
             <Button variant="outline" size="lg" className="w-full sm:w-auto px-8" onClick={() => setIsRegenerating(true)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
             </Button>
             <Button 
               variant="primary" 
               size="lg" 
               className="w-full sm:w-auto px-8"
               onClick={handleStartLearning}
               disabled={isActivating}
             >
               Start Learning <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        ) : (
          <div className="p-8 bg-[var(--bg-base)] border-t border-[var(--border-subtle)]">
             <h3 className="text-lg font-bold mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-[var(--accent-primary)]"/> What would you like to change?</h3>
             <p className="text-sm text-[var(--text-secondary)] mb-4">Provide precise instructions for the AI to redesign this roadmap. This costs 5 Coins.</p>
             <textarea
               className="w-full p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all shadow-sm resize-none mb-4"
               rows={3}
               value={additionalContext}
               onChange={(e) => setAdditionalContext(e.target.value)}
               placeholder="e.g. 'Make it more project-based' or 'Skip the basics'"
               disabled={isGenerating}
               autoFocus
             />
             <div className="flex flex-wrap gap-3 justify-end">
               <Button variant="ghost" onClick={() => setIsRegenerating(false)} disabled={isGenerating}>Cancel</Button>
               <Button variant="primary" onClick={handleRegenerate} disabled={isGenerating || !additionalContext.trim()}>
                 {isGenerating ? <Spinner size={16} /> : <RotateCcw className="w-4 h-4 mr-2" />}
                 Regenerate (5 Coins)
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
