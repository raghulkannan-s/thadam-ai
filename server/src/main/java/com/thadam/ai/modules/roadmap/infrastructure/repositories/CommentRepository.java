package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thadam.ai.modules.roadmap.core.domain.entities.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.roadmap.id = :roadmapId ORDER BY c.createdAt DESC")
    List<Comment> findByRoadmapIdOrderByCreatedAtDesc(@Param("roadmapId") Long roadmapId);
    
}
