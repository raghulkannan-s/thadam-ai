package com.thadam.ai.modules.roadmap.core.application.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thadam.ai.common.exception.ForbiddenException;
import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommentRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommentResponse;
import com.thadam.ai.modules.roadmap.core.domain.entities.Comment;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.CommentRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.CommentVoteRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;
import com.thadam.ai.modules.roadmap.core.domain.entities.CommentVote;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final RoadmapRepository roadmapRepository;

    public List<CommentResponse> getCommentsByRoadmap(String publicId, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found"));
        
        List<Comment> topLevelComments = commentRepository.findByRoadmapIdOrderByCreatedAtDesc(roadmap.getId())
                .stream()
                .filter(c -> c.getParent() == null)
                .toList();

        // Optionally, we could fetch all votes for these comments in one query. For simplicity, we fetch them recursively.
        return topLevelComments.stream()
                .map(c -> toResponse(c, user))
                .toList();
    }

    @Transactional
    public CommentResponse addComment(String publicId, CommentRequest request, User user) {
        Roadmap roadmap = roadmapRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Roadmap not found"));

        Comment parent = null;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new NotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(request.content())
                .roadmap(roadmap)
                .user(user)
                .parent(parent)
                .build();

        comment = commentRepository.save(comment);

        // Increment roadmap comment count
        roadmap.setCommentCount(roadmap.getCommentCount() + 1);
        roadmapRepository.save(roadmap);

        return toResponse(comment, user);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));

        Roadmap roadmap = comment.getRoadmap();

        if (!comment.getUser().getId().equals(user.getId()) && !roadmap.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Not authorized to delete this comment");
        }

        // Count how many comments will be deleted (this comment + all its replies recursively)
        int deletedCount = countCommentsRecursively(comment);

        commentRepository.delete(comment);

        // Decrement roadmap comment count
        roadmap.setCommentCount(Math.max(0, roadmap.getCommentCount() - deletedCount));
        roadmapRepository.save(roadmap);
    }

    private int countCommentsRecursively(Comment comment) {
        int count = 1;
        for (Comment reply : comment.getReplies()) {
            count += countCommentsRecursively(reply);
        }
        return count;
    }

    @Transactional
    public CommentResponse voteComment(Long commentId, VoteType voteType, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));

        Optional<CommentVote> existingVoteOpt = commentVoteRepository.findByCommentAndUser(comment, user);

        if (existingVoteOpt.isPresent()) {
            CommentVote existingVote = existingVoteOpt.get();
            if (existingVote.getType() == voteType) {
                // Remove vote if clicking the same button
                commentVoteRepository.delete(existingVote);
                if (voteType == VoteType.UPVOTE) {
                    comment.setUpvoteCount(Math.max(0, comment.getUpvoteCount() - 1));
                } else {
                    comment.setDownvoteCount(Math.max(0, comment.getDownvoteCount() - 1));
                }
            } else {
                // Change vote
                if (existingVote.getType() == VoteType.UPVOTE) {
                    comment.setUpvoteCount(Math.max(0, comment.getUpvoteCount() - 1));
                } else {
                    comment.setDownvoteCount(Math.max(0, comment.getDownvoteCount() - 1));
                }
                
                if (voteType == VoteType.UPVOTE) {
                    comment.setUpvoteCount(comment.getUpvoteCount() + 1);
                } else {
                    comment.setDownvoteCount(comment.getDownvoteCount() + 1);
                }
                
                existingVote.setType(voteType);
                commentVoteRepository.save(existingVote);
            }
        } else {
            // New vote
            CommentVote newVote = CommentVote.builder()
                    .user(user)
                    .comment(comment)
                    .type(voteType)
                    .build();
            commentVoteRepository.save(newVote);

            if (voteType == VoteType.UPVOTE) {
                comment.setUpvoteCount(comment.getUpvoteCount() + 1);
            } else {
                comment.setDownvoteCount(comment.getDownvoteCount() + 1);
            }
        }

        commentRepository.save(comment);
        return toResponse(comment, user);
    }

    private CommentResponse toResponse(Comment comment, User user) {
        String userVote = null;
        if (user != null) {
            Optional<CommentVote> vote = commentVoteRepository.findByCommentAndUser(comment, user);
            if (vote.isPresent()) {
                userVote = vote.get().getType().name();
            }
        }

        List<CommentResponse> replyResponses = comment.getReplies().stream()
                .map(reply -> toResponse(reply, user))
                .toList();

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getRoadmap().getPublicId(),
                comment.getUser().getPublicId(),
                comment.getUser().getName(),
                comment.getUser().getAvatarUrl(),
                comment.getUpvoteCount(),
                comment.getDownvoteCount(),
                userVote,
                replyResponses,
                comment.getCreatedAt()
        );
    }
}
