'use client';

import { TrendingUp, Compass, Sparkles, BookOpen, Clock, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTrendingRoadmaps, useMyRoadmaps } from '@/features/roadmap/api/queries';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingRoadmaps();
  const { data: myRoadmapsData, isLoading: isLoadingMy } = useMyRoadmaps();
  
  const trendingRoadmaps = trendingData?.content || [];
  const myRoadmaps = myRoadmapsData?.content || [];
  
  const activeRoadmaps = myRoadmaps.filter(r => r.status === 'ACTIVE');
  const continueLearningRoadmap = activeRoadmaps.length > 0 ? activeRoadmaps[0] : null;

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-20 pt-8 animate-fade-in-up">
      
      {/* 1. Continue Learning (Highest Priority) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight">Continue Learning</h2>
        </div>
        
        {isLoadingMy ? (
          <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] animate-pulse" />
        ) : continueLearningRoadmap ? (
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-base)] premium-card border-none shadow-sm flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/3 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--bg-surface)] p-8 flex flex-col justify-center border-r border-[var(--border-subtle)]">
               <Badge variant="success" className="w-fit mb-4">IN PROGRESS</Badge>
               <h3 className="text-2xl font-bold mb-2 leading-tight">{continueLearningRoadmap.title}</h3>
               <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-2">
                 {continueLearningRoadmap.description || "Pick up where you left off."}
               </p>
               <div className="mt-auto">
                 <Link href={`/roadmaps/${continueLearningRoadmap.id}`}>
                   <Button variant="primary" fullWidth className="h-12 shadow-md hover:shadow-lg transition-all">
                     Resume Journey <ArrowRight className="ml-2 w-4 h-4" />
                   </Button>
                 </Link>
               </div>
            </div>
            <div className="w-full sm:w-2/3 p-8 flex flex-col justify-center bg-[var(--bg-base)]">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Next Up</h4>
               </div>
               {/* Mocking the next task since we don't fetch tasks here, but it looks amazing */}
               <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer group">
                  <div className="flex items-start">
                     <div className="mt-0.5 mr-4 flex-shrink-0">
                       <div className="w-5 h-5 rounded-md border-2 border-[var(--border-default)] group-hover:border-[var(--accent-primary)] transition-colors"></div>
                     </div>
                     <div>
                       <h5 className="text-base font-semibold group-hover:text-[var(--accent-primary)] transition-colors">Continue with your next task</h5>
                       <p className="text-sm text-[var(--text-secondary)] mt-1">Jump right in to keep your momentum going.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)]/50">
            <div>
              <h3 className="text-lg font-bold mb-1">Start your journey</h3>
              <p className="text-[var(--text-secondary)] text-sm">Generate your first AI-powered learning roadmap.</p>
            </div>
            <Link href="/roadmaps/new" className="mt-4 sm:mt-0">
              <Button variant="primary">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Roadmap
              </Button>
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* 2. My Roadmaps */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold tracking-tight">My Roadmaps</h2>
              <Link href="/roadmaps/new">
                <Button variant="outline" size="sm">Create New</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {isLoadingMy ? (
                  [1,2].map(i => <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] animate-pulse" />)
               ) : myRoadmaps.length > 0 ? (
                  myRoadmaps.slice(0, 4).map(r => (
                    <Link key={r.id} href={`/roadmaps/${r.id}`}>
                      <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--accent-primary)] transition-all premium-card h-full flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-base line-clamp-2">{r.title}</h4>
                          <Badge variant={r.status === 'ACTIVE' ? 'success' : 'secondary'} className="ml-2 flex-shrink-0">
                             {r.status}
                          </Badge>
                        </div>
                        <div className="mt-auto flex items-center text-xs text-[var(--text-tertiary)] font-medium gap-3">
                           <span className="flex items-center"><Target className="w-3.5 h-3.5 mr-1" /> {r.milestoneCount} Milestones</span>
                           <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {r.durationWeeks}W</span>
                        </div>
                      </div>
                    </Link>
                  ))
               ) : (
                  <div className="col-span-full py-8 text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)]">
                     <p className="text-[var(--text-secondary)] text-sm">No roadmaps created yet.</p>
                  </div>
               )}
            </div>
          </section>
        </div>

        {/* 3. Trending Sidebar */}
        <div className="space-y-12">
          <section>
            <h2 className="text-sm font-bold tracking-tight mb-4 flex items-center text-[var(--text-primary)] uppercase">
              <TrendingUp className="mr-2 h-4 w-4 text-[var(--accent-primary)]" />
              Trending Now
            </h2>
            <div className="flex flex-col space-y-3">
              {isLoadingTrending ? (
                 [1,2,3].map(i => <div key={i} className="h-20 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] animate-pulse" />)
              ) : (
                 trendingRoadmaps.slice(0, 5).map((roadmap, idx) => (
                  <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
                    <div className="group flex items-center justify-between rounded-[var(--radius-md)] border border-transparent bg-[var(--bg-surface)]/50 p-3 transition-all hover:bg-[var(--bg-elevated)] cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{roadmap.title}</h4>
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5">
                            By @{roadmap.userName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link href="/community">
              <Button variant="ghost" fullWidth className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Explore Community
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
