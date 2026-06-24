package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.roadmap.core.domain.entities.Comment;
import com.thadam.ai.modules.roadmap.core.domain.entities.CommentVote;

public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    
    Optional<CommentVote> findByCommentAndUser(Comment comment, User user);
    
    List<CommentVote> findByCommentIdInAndUserId(List<Long> commentIds, Long userId);
}
