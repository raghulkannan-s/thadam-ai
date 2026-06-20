import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { GitFork, ArrowUpCircle, Clock, ArrowDownCircle } from 'lucide-react';
import { CommunityRoadmapResponse } from '@/lib/types';
import { useVoteRoadmap, useForkRoadmap } from '@/features/roadmap/api/mutations';

export function CommunityRoadmapCard({ roadmap }: { roadmap: CommunityRoadmapResponse }) {
  const router = useRouter();
  const { mutate: voteRoadmap, isPending: isVoting } = useVoteRoadmap();
  const { mutate: forkRoadmap, isPending: isForking } = useForkRoadmap();

  const handleVote = (e: React.MouseEvent, type: "UPVOTE" | "DOWNVOTE") => {
    e.preventDefault(); // Prevent navigating to roadmap
    e.stopPropagation();
    voteRoadmap({ roadmapId: roadmap.id, type });
  };

  const handleFork = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    forkRoadmap(roadmap.id, {
      onSuccess: (newRoadmap) => {
        router.push(`/roadmaps/${newRoadmap.id}`);
      }
    });
  };

  return (
    <Card hoverable className="group flex flex-col overflow-hidden h-full">
      <Link href={`/roadmaps/${roadmap.id}`} className="flex-1 flex flex-col block">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1 flex-wrap">
              <Badge variant="secondary" className="capitalize">{roadmap.difficulty?.toLowerCase() || 'Intermediate'}</Badge>
              <Badge variant="outline">{roadmap.durationWeeks ? `${roadmap.durationWeeks}W` : '4W'}</Badge>
            </div>
            
            {/* Voting Actions */}
            <div className="flex items-center gap-1 z-10">
              <button 
                onClick={(e) => handleVote(e, "UPVOTE")} 
                disabled={isVoting}
                className={`p-1.5 rounded-md hover:bg-green-500/10 transition-colors ${roadmap.userVote === 'UPVOTE' ? 'text-green-500 bg-green-500/10 ring-1 ring-green-500/30' : 'text-[var(--text-tertiary)]'}`}
                title="Upvote"
              >
                <ArrowUpCircle className={`h-5 w-5 ${roadmap.userVote === 'UPVOTE' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </button>
              <span className="text-sm font-bold text-[var(--text-primary)] min-w-[1.5rem] text-center">
                {(roadmap.upvoteCount || 0) - (roadmap.downvoteCount || 0)}
              </span>
              <button 
                onClick={(e) => handleVote(e, "DOWNVOTE")} 
                disabled={isVoting}
                className={`p-1.5 rounded-md hover:bg-red-500/10 transition-colors ${roadmap.userVote === 'DOWNVOTE' ? 'text-red-500 bg-red-500/10 ring-1 ring-red-500/30' : 'text-[var(--text-tertiary)]'}`}
                title="Downvote"
              >
                <ArrowDownCircle className={`h-5 w-5 ${roadmap.userVote === 'DOWNVOTE' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </button>
            </div>
          </div>
          
          <h3 className="text-xl font-bold tracking-tight leading-snug mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
            {roadmap.title}
          </h3>
          
          <div className="mt-auto pt-4 flex flex-col space-y-2.5 text-xs text-[var(--text-secondary)] font-medium">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> {roadmap.milestoneCount} milestones
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <GitFork className="mr-2 h-4 w-4 text-[var(--text-tertiary)]" /> {roadmap.forkCount} forks
              </div>
              
              {/* Fork Action Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs px-2 z-10 relative" 
                onClick={handleFork}
                disabled={isForking}
              >
                <GitFork className="mr-1 h-3 w-3" /> Fork
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex justify-between items-center z-10 relative">
        <Link href={`/creators/${roadmap.userId}`} className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
          <Avatar fallback={roadmap.userName} size="sm" className="h-6 w-6" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {roadmap.userName}
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
}
