'use client';

import { use } from 'react';

import { GitFork, ArrowUpCircle, Compass, ArrowLeft, Clock } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { CommunityRoadmapResponse } from '@/lib/types';

import Link from 'next/link';

import { useCreatorRoadmaps, useCreatorProfile } from '@/features/roadmap/api/queries';
import { RoadmapCardSkeleton } from '@/shared/ui/Skeleton';
import { CommunityRoadmapCard } from '@/features/community/components/CommunityRoadmapCard';

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const { data, isLoading, isError } = useCreatorRoadmaps(userId);
  const { data: profile } = useCreatorProfile(userId);

  const roadmaps = data?.content || [];
  
  const username = profile?.name || (roadmaps.length > 0 ? roadmaps[0].userName : `User ${userId.substring(0, 8)}...`);

  return (
    <div className="mx-auto max-w-6xl pb-20">
      
      <div className="w-full flex justify-start mb-6">
        <Link 
          href="/people" 
          className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to People
        </Link>
      </div>

      {/* Profile Header */}
      <div className="relative mb-20">
        <div className="h-48 w-full rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden" />
        
        <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
          <Avatar 
            src={profile?.avatarUrl}
            fallback={username} 
            size="xl" 
            className="h-32 w-32 border-4 border-[var(--bg-base)] shadow-2xl bg-white" 
          />
          <div className="mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight">@{username}</h1>
            <p className="text-[var(--text-secondary)] font-medium">Creator Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
        
        {/* Left Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">About</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Creator profiles with full statistics are coming soon. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Compass className="mr-2 h-6 w-6 text-[var(--accent-primary)]" />
            Published Roadmaps
          </h2>
          
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <RoadmapCardSkeleton />
              <RoadmapCardSkeleton />
            </div>
          )}

          {!isLoading && isError && (
             <p className="text-[var(--error)]">Failed to load roadmaps.</p>
          )}

          {!isLoading && !isError && roadmaps.length === 0 && (
            <EmptyState 
              title="No Roadmaps" 
              description={`This creator hasn't published any roadmaps yet.`}
            />
          )}

          {!isLoading && !isError && roadmaps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {roadmaps.map((roadmap: CommunityRoadmapResponse) => (
                <CommunityRoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
