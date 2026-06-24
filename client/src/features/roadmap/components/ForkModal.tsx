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
  onRegenerate: (visibility: string, customPrompt: string) => void;
  isForking: boolean;
  isRegenerating: boolean;
  isOwner?: boolean;
}

export function ForkModal({ isOpen, onClose, roadmap, onFork, onRegenerate, isForking, isRegenerating, isOwner = false }: ForkModalProps) {
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [customPrompt, setCustomPrompt] = useState("");

  const isLoading = isForking || isRegenerating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isOwner ? "Regenerate Roadmap" : "Fork Roadmap"}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? `Regenerate "${roadmap.title}" with new AI instructions to create a better version.` 
              : `Choose how you want to copy "${roadmap.title}" to your account.`}
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

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Custom Instructions (Optional)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g., Focus more on backend, use Python instead of Java, make it 8 weeks instead..."
              className="w-full min-h-[100px] p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-y text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-2">
          {!isOwner && (
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => onFork(visibility)}
              disabled={isLoading}
            >
              <Copy className="mr-2 h-4 w-4" />
              {isForking ? "Forking..." : "Exact Copy (Free)"}
            </Button>
          )}
          <Button 
            variant="primary" 
            className="flex-1 h-12 bg-[var(--accent-primary)] hover:opacity-90 border-none text-white"
            onClick={() => onRegenerate(visibility, customPrompt)}
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
