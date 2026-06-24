import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { useRoadmapComments } from '@/features/roadmap/api/queries';
import { useAddComment, useDeleteComment, useVoteComment } from '@/features/roadmap/api/mutations';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { MessageSquare, Send, Trash2, ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentResponse } from '@/lib/types';

function CommentItem({ comment, roadmapId }: { comment: CommentResponse; roadmapId: string }) {
  const { user } = useAuth();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const { mutate: voteComment, isPending: isVoting } = useVoteComment();
  const { mutate: addComment, isPending: isAdding } = useAddComment();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment({ commentId: comment.id, roadmapId });
    }
  };

  const handleVote = (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) return;
    voteComment({ commentId: comment.id, type });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;
    addComment(
      { roadmapId, content: replyContent, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent('');
          setIsReplying(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 group">
        <Avatar src={comment.userAvatarUrl} fallback={comment.userName} size="md" className="shrink-0" />
        <div className="flex-1 bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border-subtle)] relative">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm text-[var(--text-primary)]">{comment.userName}</span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {user && (user.id === comment.userId) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words mb-3">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleVote('UPVOTE')}
                disabled={isVoting || !user}
                className={`p-1 rounded transition-colors ${comment.userVote === 'UPVOTE' ? 'text-green-500 bg-green-500/10' : 'hover:bg-[var(--bg-surface)] hover:text-green-500'} disabled:opacity-50`}
              >
                <ThumbsUp className={`w-4 h-4 ${comment.userVote === 'UPVOTE' ? 'fill-current' : ''}`} />
              </button>
              <span className="min-w-[1ch] text-center">{(comment.upvoteCount || 0) - (comment.downvoteCount || 0)}</span>
              <button 
                onClick={() => handleVote('DOWNVOTE')}
                disabled={isVoting || !user}
                className={`p-1 rounded transition-colors ${comment.userVote === 'DOWNVOTE' ? 'text-red-500 bg-red-500/10' : 'hover:bg-[var(--bg-surface)] hover:text-red-500'} disabled:opacity-50`}
              >
                <ThumbsDown className={`w-4 h-4 ${comment.userVote === 'DOWNVOTE' ? 'fill-current' : ''}`} />
              </button>
            </div>
            {user && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
              >
                <CornerDownRight className="w-3.5 h-3.5" /> Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="ml-12 flex gap-3">
          <div className="flex-1">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full min-h-[60px] p-3 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all resize-y text-sm"
              disabled={isAdding}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!replyContent.trim() || isAdding}>
                {isAdding ? "Replying..." : "Reply"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 sm:ml-12 space-y-4 border-l-2 border-[var(--border-subtle)] pl-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} roadmapId={roadmapId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RoadmapComments({ roadmapId }: { roadmapId: string }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  
  const { data: comments = [], isLoading } = useRoadmapComments(roadmapId);
  const { mutate: addComment, isPending: isAdding } = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    addComment(
      { roadmapId, content },
      {
        onSuccess: () => setContent(''),
      }
    );
  };

  // Count total comments including replies for the header
  const countComments = (list: CommentResponse[]): number => {
    return list.reduce((total, comment) => total + 1 + (comment.replies ? countComments(comment.replies) : 0), 0);
  };
  const totalComments = countComments(comments);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading comments...</div>;
  }

  return (
    <div className="mt-12 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-5 h-5 mr-2 text-[var(--text-secondary)]" />
        <h3 className="text-xl font-bold">Comments ({totalComments})</h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          <Avatar fallback={user.name} size="md" className="shrink-0" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment... Ask a question or share a resource!"
              className="w-full min-h-[80px] p-3 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all resize-y text-sm"
              disabled={isAdding}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                disabled={!content.trim() || isAdding}
                className="gap-2"
                size="sm"
              >
                {isAdding ? "Posting..." : <><Send className="w-4 h-4" /> Post Comment</>}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[var(--bg-base)] rounded-lg text-center text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          Please log in to join the discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] py-4 text-sm">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} roadmapId={roadmapId} />
          ))
        )}
      </div>
    </div>
  );
}
