'use client';

import { useEffect, useState } from 'react';
import { X, Play, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { TaskResponse } from '@/lib/types';

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskResponse | null;
  onUpdateStatus: (taskId: number, newStatus: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  isUpdating: boolean;
  isReadOnly?: boolean;
}

export function TaskViewModal({
  isOpen,
  onClose,
  task,
  onUpdateStatus,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  isUpdating,
  isReadOnly = false
}: TaskViewModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const isCompleted = task.status === 'DONE';
  const isInProgress = task.status === 'IN_PROGRESS';

  const handleStatusChange = () => {
    if (isCompleted) {
      onUpdateStatus(task.id, 'TODO');
    } else if (isInProgress) {
      onUpdateStatus(task.id, 'DONE');
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        if (hasNext) {
          onNext();
        }
      }, 2000); // Wait for confetti animation, then move to next
    } else {
      onUpdateStatus(task.id, 'IN_PROGRESS');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[var(--bg-surface)] shadow-2xl transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <Badge variant={isCompleted ? 'success' : isInProgress ? 'default' : 'secondary'}>
              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'To Do'}
            </Badge>
            <Badge variant="outline" className="text-[var(--text-tertiary)] border-[var(--border-subtle)]">
              {task.priority || 'Medium'} Priority
            </Badge>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          <h2 className={`mb-4 text-3xl font-extrabold tracking-tight ${isCompleted ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
            {task.title}
          </h2>
          
          <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
            <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
          </div>

          {/* Action Area */}
          {!isReadOnly && (
            <div className="mt-10 flex flex-col items-center justify-center rounded-xl bg-[var(--bg-elevated)] p-8 border border-[var(--border-subtle)]">
              {isInProgress ? (
                <>
                  <p className="mb-4 text-sm font-medium text-[var(--text-secondary)]">You&apos;re currently working on this task.</p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-lg shadow-green-500/20 bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6" /> Mark as Complete
                  </Button>
                </>
              ) : isCompleted ? (
                <>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="mb-4 font-bold text-green-500">Task Completed!</p>
                  <Button 
                    variant="ghost" 
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                  >
                    Reopen Task
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm font-medium text-[var(--text-secondary)]">Ready to dive in?</p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-lg shadow-[var(--accent-primary)]/20"
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <Play className="mr-2 h-5 w-5" /> Start Task
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <Button 
            variant="ghost" 
            onClick={onPrevious} 
            disabled={!hasPrevious}
            className="text-[var(--text-secondary)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <div className="text-xs text-[var(--text-tertiary)]">
            {/* Can add X of Y tasks indicator here */}
          </div>
          {hasNext && (
            <Button 
              variant="ghost" 
              onClick={onNext} 
              className="text-[var(--text-primary)] font-semibold"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Confetti Animation Overlay */}
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
            <div className="animate-ping absolute h-32 w-32 rounded-full bg-green-500/30"></div>
          </div>
        )}

      </div>
    </div>
  );
}
