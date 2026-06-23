"use client";

import { use } from "react";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { usePublicProfile } from "@/features/roadmap/api/queries";
import { useVerifyUser } from "@/features/roadmap/api/mutations";
import { PageLoader } from "@/shared/ui/LoadingSpinner";
import { CheckCircle, XCircle, User, Compass, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const { data: profile, isLoading, isError } = usePublicProfile(userId);
  const { mutate: verifyUser, isPending: isVerifying } = useVerifyUser();
  const { user: currentUser } = useAuth();

  if (isLoading) return <PageLoader />;
  
  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertTriangle className="h-16 w-16 text-[var(--warning)] mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile Not Found</h1>
        <p className="text-[var(--text-secondary)] mt-2">The user you are looking for does not exist or has been removed.</p>
        <Link href="/" className="mt-6 text-[var(--accent-primary)] hover:underline">Return Home</Link>
      </div>
    );
  }

  const handleVote = (isReal: boolean) => {
    if (!currentUser) return; // In a real app we might prompt them to login
    verifyUser({ userId, isReal });
  };

  const isVerified = profile.verificationScore > 5;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header Banner */}
      <div className="h-48 w-full bg-[var(--accent-primary)]"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-8 border border-[var(--border-subtle)] relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar 
                src={profile.avatarUrl} 
                fallback={profile.name} 
                size="xl" 
                className="h-32 w-32 border-4 border-[var(--bg-surface)] shadow-lg bg-[var(--bg-surface)]"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{profile.name}</h1>
                  {isVerified && (
                    <Badge variant="success" className="flex items-center gap-1.5 bg-green-500/20 text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified Real
                    </Badge>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] mt-1 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile.role === 'USER' ? 'Learner' : profile.role}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full">
                    <Compass className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span className="font-semibold text-[var(--text-primary)]">{profile.roadmapCount}</span> Roadmaps
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full">
                     <span className="font-semibold text-[var(--warning)]">{profile.coins}</span> Coins
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Voting */}
            <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)] sm:w-72 w-full text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Community Verification</p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Is this a real person?</p>
              
              <div className="flex items-center justify-center gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                  onClick={() => handleVote(true)}
                  disabled={isVerifying || !currentUser || currentUser.id === userId}
                  title={!currentUser ? "Login to vote" : "Vote Yes"}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Real
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                  onClick={() => handleVote(false)}
                  disabled={isVerifying || !currentUser || currentUser.id === userId}
                  title={!currentUser ? "Login to vote" : "Vote No"}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Fake
                </Button>
              </div>
              <div className="mt-3 text-xs text-[var(--text-tertiary)] flex justify-between px-2">
                <span>Score: {profile.verificationScore}</span>
                {!currentUser && <span>Login required to vote</span>}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
