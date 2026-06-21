'use client';

import { useState, useEffect, use } from 'react';
import { ArrowUpCircle, GitFork, Clock, Share2, Play, CheckCircle2, ChevronDown, ChevronUp, Target, Users, LayoutList, Circle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { toast } from 'sonner';

import { useRoadmap, useRoadmapMilestones, useRoadmapTasks } from '@/features/roadmap/api/queries';
import { useForkRoadmap, useVoteRoadmap, useUpdateTaskStatus } from '@/features/roadmap/api/mutations';
import { useRouter } from 'next/navigation';
import { TaskViewModal } from '@/features/roadmap/components/TaskViewModal';
import { TaskResponse } from '@/lib/types';

export default function RoadmapContentPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const roadmapId = unwrappedParams.id;
  const router = useRouter();

  
  const { data: roadmap, isLoading: isRoadmapLoading, isError: isRoadmapError, refetch: refetchRoadmap } = useRoadmap(roadmapId);
  const { data: milestones, isLoading: isMilestonesLoading } = useRoadmapMilestones(roadmapId);
  const { data: tasksData, isLoading: isTasksLoading } = useRoadmapTasks(roadmapId);
  
  const { mutate: forkRoadmap, isPending: isForking } = useForkRoadmap();
  const { mutate: voteRoadmap, isPending: isVoting } = useVoteRoadmap();
  const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTaskStatus();

  // Task Modal State
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({});

  const tasks = tasksData?.content || [];
  
  // Initialize first milestone to be expanded
  useEffect(() => {
    if (milestones && milestones.length > 0) {
      setExpandedMilestones(prev => {
        if (Object.keys(prev).length === 0) {
          return { [milestones[0].id]: true };
        }
        return prev;
      });
    }
  }, [milestones]);

  const toggleMilestone = (id: number) => {
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isRoadmapLoading || isMilestonesLoading || isTasksLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[var(--accent-primary)]"></div>
        <p className="mt-4 text-[var(--text-secondary)] animate-pulse">Loading roadmap...</p>
      </div>
    );
  }
  
  if (isRoadmapError) {
    return (
      <div className="flex justify-center p-20">
        <ErrorState title="Roadmap Not Found" message="We could not load this roadmap. It may have been deleted." onRetry={refetchRoadmap} />
      </div>
    );
  }
  
  if (!roadmap || !roadmapId) {
    return <div className="p-20 text-center"><EmptyState title="Roadmap unavailable" description="This roadmap could not be loaded." /></div>;
  }

  // Stats calculation
  const completedCount = tasks.filter(t => t.status === "DONE").length;
  const completionRateNum = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const duration = milestones && milestones.length > 0 ? `${milestones.length} Weeks` : "Unknown";

  // Finding next active task
  const nextTask = tasks.find(t => t.status === "IN_PROGRESS") || tasks.find(t => t.status === "TODO") || null;

  const handleStartContinue = () => {
    if (nextTask) {
      setActiveTask(nextTask);
      // Ensure milestone is expanded
      if (nextTask.milestoneId) {
        setExpandedMilestones(prev => ({ ...prev, [nextTask.milestoneId!]: true }));
      }
    } else {
      toast.success("You've completed all tasks!");
    }
  };

  const handleTaskAction = (taskId: number, newStatus: string) => {
    updateTask({ taskId, status: newStatus });
    // Optimistic local update for modal
    if (activeTask && activeTask.id === taskId) {
      setActiveTask({ ...activeTask, status: newStatus });
    }
  };

  const handleFork = () => {
    forkRoadmap(roadmapId, {
      onSuccess: (newRoadmap) => {
        router.push(`/roadmaps/${newRoadmap.id}`);
      }
    });
  };

  const handleVote = (type: "UPVOTE" | "DOWNVOTE") => {
    voteRoadmap({ roadmapId, type });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  // Modal Navigation
  const currentIndex = activeTask ? tasks.findIndex(t => t.id === activeTask.id) : -1;
  const hasNext = currentIndex !== -1 && currentIndex < tasks.length - 1;
  const hasPrevious = currentIndex > 0;

  const navigateTask = (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNext) {
      setActiveTask(tasks[currentIndex + 1]);
    } else if (direction === 'prev' && hasPrevious) {
      setActiveTask(tasks[currentIndex - 1]);
    }
  };
  
  return (
    <div className="mx-auto max-w-5xl pb-20 pt-6">
      
      {/* SECTION 1: Rich Header Banner */}
      <div className="mb-12 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] shadow-xl relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--accent-primary)] to-purple-500"></div>
        <div className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-transparent">
                  Interactive Journey
                </Badge>
                <Badge variant="outline">Intermediate</Badge>
                <Badge variant={roadmap.visibility === "PUBLIC" ? "success" : "outline"}>
                  {roadmap.visibility}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-[var(--text-primary)]">
                {roadmap.title}
              </h1>
              {roadmap.description && (
                <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                  {roadmap.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" /> 
                  <span>Est. {duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" /> 
                  <span>{milestones?.length || 0} Milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <LayoutList className="h-5 w-5 text-[var(--accent-primary)]" /> 
                  <span>{tasks.length} Tasks</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:min-w-[280px]">
              {/* Progress Box */}
              <div className="bg-[var(--bg-base)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Your Progress</span>
                  <span className="text-2xl font-black text-green-500">{completionRateNum}%</span>
                </div>
                <div className="w-full bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden border border-[var(--border-subtle)]">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${completionRateNum}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-3 text-right">
                  {completedCount} of {tasks.length} tasks completed
                </p>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full h-14 text-lg font-bold shadow-lg shadow-[var(--accent-primary)]/20 group"
                onClick={handleStartContinue}
              >
                <Play className="mr-2 h-6 w-6 transition-transform group-hover:scale-110" /> 
                {completionRateNum === 0 ? 'Start Learning' : completionRateNum === 100 ? 'Review Journey' : 'Continue Learning'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Footer actions of Banner */}
        <div className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] p-4 px-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
             <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 124 Learners</div>
             <div className="flex items-center gap-1.5"><GitFork className="h-4 w-4" /> {roadmap.forkedFromId ? 'Forked' : 'Original'}</div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="md" onClick={() => handleVote("UPVOTE")} disabled={isVoting} className={roadmap.userVote === 'UPVOTE' ? 'text-green-600 bg-green-500/20 font-semibold ring-1 ring-green-500/50' : 'hover:text-green-600 hover:bg-green-500/10'}>
               <ArrowUpCircle className="mr-2 h-5 w-5" strokeWidth={roadmap.userVote === 'UPVOTE' ? 2.5 : 2} /> 
               {roadmap.upvoteCount > 0 ? roadmap.upvoteCount : 'Upvote'}
             </Button>
             <Button variant="ghost" size="md" onClick={() => handleVote("DOWNVOTE")} disabled={isVoting} className={roadmap.userVote === 'DOWNVOTE' ? 'text-red-600 bg-red-500/20 font-semibold ring-1 ring-red-500/50' : 'hover:text-red-600 hover:bg-red-500/10'}>
               <ArrowUpCircle className="mr-2 h-5 w-5 rotate-180" strokeWidth={roadmap.userVote === 'DOWNVOTE' ? 2.5 : 2} /> 
               {roadmap.downvoteCount > 0 ? roadmap.downvoteCount : 'Downvote'}
             </Button>
             <Button variant="ghost" size="md" onClick={handleShare}>
               <Share2 className="mr-2 h-5 w-5" /> Share
             </Button>
             <Button variant="outline" size="md" onClick={handleFork} disabled={isForking}>
               <GitFork className="mr-2 h-5 w-5" /> Fork {roadmap.forkCount > 0 && `(${roadmap.forkCount})`}
             </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: The Learning Path (Milestones) */}
      <h2 className="text-3xl font-extrabold tracking-tight mb-8">Journey Milestones</h2>
      
      {(!milestones || milestones.length === 0) ? (
         <EmptyState title="No Milestones" description="This roadmap doesn't have any content yet." />
      ) : (
         <div className="space-y-6 relative border-l-2 border-[var(--border-subtle)] ml-4 sm:ml-8 pl-6 sm:pl-10 py-4">
            {milestones.map((milestone, mIdx) => {
               const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id);
               const mCompleted = milestoneTasks.filter(t => t.status === 'DONE').length;
               const mTotal = milestoneTasks.length;
               const mProgress = mTotal === 0 ? 0 : Math.round((mCompleted / mTotal) * 100);
               const isExpanded = !!expandedMilestones[milestone.id];
               
               return (
                  <div key={milestone.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[35px] sm:-left-[51px] top-6 h-6 w-6 rounded-full border-4 border-[var(--bg-base)] bg-[var(--accent-primary)] shadow-sm flex items-center justify-center">
                       {mProgress === 100 && <CheckCircle2 className="h-4 w-4 text-white absolute" />}
                    </div>

                    <Card className="overflow-hidden transition-shadow hover:shadow-md border-[var(--border-subtle)]">
                       {/* Milestone Header (Clickable) */}
                       <div 
                          className="p-5 sm:p-6 cursor-pointer flex items-center justify-between bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors"
                          onClick={() => toggleMilestone(milestone.id)}
                       >
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-bold text-[var(--accent-primary)] uppercase tracking-wider">Phase {mIdx + 1}</span>
                                {mProgress === 100 && <Badge variant="success">Completed</Badge>}
                             </div>
                             <h3 className="text-xl font-bold text-[var(--text-primary)]">{milestone.title}</h3>
                             {milestone.description && <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">{milestone.description}</p>}
                          </div>
                          <div className="flex items-center gap-6 ml-4">
                             <div className="hidden sm:block text-right">
                                <div className="text-sm font-semibold text-[var(--text-secondary)] mb-1">{mProgress}%</div>
                                <div className="w-24 bg-[var(--bg-base)] rounded-full h-1.5">
                                   <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${mProgress}%` }} />
                                </div>
                             </div>
                             <div className="text-[var(--text-tertiary)] bg-[var(--bg-base)] p-2 rounded-full">
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                             </div>
                          </div>
                       </div>

                       {/* Milestone Tasks (Accordion Body) */}
                       {isExpanded && (
                          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 sm:p-6 space-y-3">
                             {milestoneTasks.length === 0 ? (
                                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No tasks in this milestone.</p>
                             ) : (
                                milestoneTasks.map((task) => {
                                   const isDone = task.status === 'DONE';
                                   const isCurrent = task.status === 'IN_PROGRESS';
                                   
                                   return (
                                      <div 
                                         key={task.id} 
                                         onClick={() => setActiveTask(task)}
                                         className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border ${
                                            isDone ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-75' : 
                                            isCurrent ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/30 shadow-sm' : 
                                            'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-tertiary)]'
                                         }`}
                                      >
                                         <div className="mr-4">
                                            {isDone ? (
                                               <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            ) : isCurrent ? (
                                               <Circle className="h-6 w-6 text-[var(--accent-primary)] animate-pulse fill-[var(--accent-primary)]/20" />
                                            ) : (
                                               <Circle className="h-6 w-6 text-[var(--border-subtle)]" />
                                            )}
                                         </div>
                                         <div className="flex-1">
                                            <h4 className={`font-semibold ${isDone ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                                               {task.title}
                                            </h4>
                                         </div>
                                         <Button variant="ghost" size="sm" className="hidden sm:flex text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                            View Task
                                         </Button>
                                      </div>
                                   );
                                })
                             )}
                          </div>
                       )}
                    </Card>
                  </div>
               );
            })}
         </div>
      )}

      {/* Task Modal Integration */}
      <TaskViewModal 
         isOpen={!!activeTask}
         onClose={() => setActiveTask(null)}
         task={activeTask}
         onUpdateStatus={handleTaskAction}
         onNext={() => navigateTask('next')}
         onPrevious={() => navigateTask('prev')}
         hasNext={hasNext}
         hasPrevious={hasPrevious}
         isUpdating={isUpdatingTask}
      />
    </div>
  );
}
