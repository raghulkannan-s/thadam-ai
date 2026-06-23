import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Eye, EyeOff, Sparkles, Copy } from "lucide-react";
import { CommunityRoadmapResponse } from "@/lib/types";

interface ForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: CommunityRoadmapResponse;
  onFork: (visibility: string) => void;
  onRegenerate: (visibility: string) => void;
  isForking: boolean;
  isRegenerating: boolean;
}

export function ForkModal({ isOpen, onClose, roadmap, onFork, onRegenerate, isForking, isRegenerating }: ForkModalProps) {
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  const isLoading = isForking || isRegenerating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Fork Roadmap</DialogTitle>
          <DialogDescription>
            Choose how you want to copy "{roadmap.title}" to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Visibility</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                disabled={isLoading}
                className={`flex-1 rounded-xl border p-3 flex items-center justify-center transition-all ${visibility === "PUBLIC" ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/20" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}
              >
                <Eye className="w-4 h-4 mr-2" /> Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                disabled={isLoading}
                className={`flex-1 rounded-xl border p-3 flex items-center justify-center transition-all ${visibility === "PRIVATE" ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/20" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}
              >
                <EyeOff className="w-4 h-4 mr-2" /> Private
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => onFork(visibility)}
            disabled={isLoading}
          >
            <Copy className="mr-2 h-4 w-4" />
            {isForking ? "Forking..." : "Exact Copy (Free)"}
          </Button>
          <Button 
            variant="primary" 
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none"
            onClick={() => onRegenerate(visibility)}
            disabled={isLoading}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isRegenerating ? "Generating..." : "AI Regenerate (3 Coins)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
