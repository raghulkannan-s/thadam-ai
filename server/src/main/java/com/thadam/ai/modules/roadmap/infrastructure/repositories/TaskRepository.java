package com.thadam.ai.modules.roadmap.infrastructure.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.thadam.ai.modules.roadmap.core.domain.entities.Task;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMilestoneIdOrderByOrderIndexAsc(Long milestoneId);

    Page<Task> findByRoadmapId(Long roadmapId, Pageable pageable);

    Page<Task> findByAssigneeId(Long assigneeId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.roadmap.id = :roadmapId AND (:status IS NULL OR t.status = :status)")
    Page<Task> findByRoadmapIdAndStatus(Long roadmapId, TaskStatus status, Pageable pageable);

    long countByRoadmapId(Long roadmapId);

    long countByMilestoneId(Long milestoneId);

    @Query("SELECT t.roadmap.id, COUNT(t) FROM Task t WHERE t.roadmap.id IN :roadmapIds GROUP BY t.roadmap.id")
    List<Object[]> countByRoadmapIdIn(@org.springframework.data.repository.query.Param("roadmapIds") List<Long> roadmapIds);
}
