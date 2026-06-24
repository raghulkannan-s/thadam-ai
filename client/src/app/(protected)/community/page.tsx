'use client';

import { useState } from 'react';
import { Search, Flame, Clock, GitFork, ArrowUpCircle } from 'lucide-react';
import { CommunityRoadmapResponse } from '@/lib/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { CommunityRoadmapCard } from '@/features/community/components/CommunityRoadmapCard';
import { RoadmapCardSkeleton } from '@/shared/ui/Skeleton';
import { useTrendingRoadmaps, useSearchRoadmaps, useNewestRoadmaps } from '@/features/roadmap/api/queries';
import { useDebounce } from '@/hooks/use-debounce';

const filters = ['Trending', 'Newest'] as const;
type FilterType = (typeof filters)[number];

const categories = ['ALL', 'TECHNOLOGY', 'ARTS', 'SCIENCE', 'HEALTH', 'BUSINESS', 'COOKING', 'LIFESTYLE', 'OTHER'] as const;
type CategoryType = (typeof categories)[number];

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('Trending');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const categoryParam = activeCategory === 'ALL' ? undefined : activeCategory;

  const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError, refetch: refetchTrending } = useTrendingRoadmaps(categoryParam);
  const { data: newestData, isLoading: isNewestLoading, isError: isNewestError, refetch: refetchNewest } = useNewestRoadmaps(categoryParam);
  const { data: searchData, isLoading: isSearchLoading, isError: isSearchError, refetch: refetchSearch } = useSearchRoadmaps(debouncedSearch, categoryParam);
  
  const isSearching = debouncedSearch.length > 0;
  
  let roadmaps: CommunityRoadmapResponse[] = [];
  let isLoading = false;
  let isError = false;
  let refetch = refetchTrending;

  if (isSearching) {
    roadmaps = searchData?.content || [];
    isLoading = isSearchLoading;
    isError = isSearchError;
    refetch = refetchSearch;
  } else if (activeFilter === 'Newest') {
    roadmaps = newestData?.content || [];
    isLoading = isNewestLoading;
    isError = isNewestError;
    refetch = refetchNewest;
  } else {
    roadmaps = trendingData?.content || [];
    isLoading = isTrendingLoading;
    isError = isTrendingError;
    refetch = refetchTrending;
  }

  return (
    <div className="mx-auto max-w-7xl pb-20 pt-4">
      
      {/* Header & Search */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Explore Roadmaps</h1>
          <p className="text-[var(--text-secondary)] text-lg">Discover what the community is learning.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search roadmaps..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
              aria-label="Search roadmaps"
            />
          </div>
          <Button 
            variant="primary" 
            className="font-semibold shadow-none whitespace-nowrap"
            onClick={() => router.push('/roadmaps/new')}
          >
            Create Roadmap
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar space-x-2">
          {filters.map(filter => (
            <Button 
              key={filter} 
              variant={activeFilter === filter ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="rounded-full px-5 font-semibold text-xs tracking-wide"
            >
              {filter === 'Trending' && <Flame className="mr-2 h-4 w-4 text-[var(--warning)]" />}
              {filter === 'Newest' && <Clock className="mr-2 h-4 w-4 text-[var(--info)]" />}
              {filter}
            </Button>
          ))}
          <div className="w-px h-6 bg-[var(--border-default)] mx-2 self-center"></div>
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 font-semibold text-xs tracking-wide ${activeCategory === cat ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : ''}`}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <RoadmapCardSkeleton />
          <RoadmapCardSkeleton />
          <RoadmapCardSkeleton />
          <RoadmapCardSkeleton />
        </div>
      )}
      
      {isError && !isLoading && (
        <ErrorState 
          title="Could not load community feed" 
          message="We ran into an issue fetching the latest roadmaps." 
          onRetry={refetch} 
        />
      )}
      
      {!isLoading && !isError && roadmaps.length === 0 && (
        <EmptyState 
          title={isSearching ? "No results found" : "No roadmaps yet"}
          description={isSearching 
            ? `No roadmaps match "${debouncedSearch}". Try a different search.`
            : "The community is quiet right now. Be the first to share a learning path!"
          }
        />
      )}
      
      {!isLoading && !isError && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roadmaps.map((roadmap: CommunityRoadmapResponse) => (
            <CommunityRoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      )}
      
    </div>
  );
}
